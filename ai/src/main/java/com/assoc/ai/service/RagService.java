package com.assoc.ai.service;

import com.assoc.ai.dto.RagChatRequest;
import com.assoc.ai.dto.RagChatResponse;
import com.assoc.ai.dto.SearchResult;
import com.assoc.ai.dto.VectorStats;
import com.assoc.ai.embedding.EmbeddingService;
import com.assoc.ai.entity.ChatMessage;
import com.assoc.ai.repository.ChatMessageRepository;
import com.assoc.ai.repository.VectorDocumentRepository;
import com.assoc.ai.store.VectorStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.*;

/**
 * RAG (Retrieval Augmented Generation) service with multi-turn conversation support.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagService {

    private final VectorStore vectorStore;
    private final EmbeddingService embeddingService;
    private final VectorDocumentRepository vectorDocumentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatClient.Builder chatClientBuilder;

    @Value("${kb.rag.top-k:8}")
    private int defaultTopK;

    @Value("${kb.rag.max-context-chars:8000}")
    private int maxContextChars;

    @Value("${kb.rag.max-history-messages:10}")
    private int maxHistoryMessages;

    private static final String SYSTEM_PROMPT = """
            你是一个专业的知识助手，基于参考资料回答问题。
            如果参考资料中没有相关信息，诚实说明。
            使用中文回答。
            """;

    private static final String RAG_USER_TEMPLATE = """
            参考资料：
            %s

            问题：%s
            """;

    /**
     * Search for relevant documents using hybrid search.
     */
    public List<SearchResult> search(String query, List<String> entityTypes, Integer topK) {
        if (topK == null || topK <= 0) {
            topK = defaultTopK;
        }

        float[] queryVector = embeddingService.embed(query);
        return vectorStore.hybridSearch(queryVector, query, entityTypes, topK);
    }

    /**
     * Perform RAG chat with streaming response, references, and conversation history.
     */
    @Transactional
    public StreamingChatResult chatWithReferences(RagChatRequest request) {
        // Generate or use existing conversationId
        String conversationId = request.getConversationId();
        boolean isNewConversation = (conversationId == null || conversationId.isBlank());
        if (isNewConversation) {
            conversationId = UUID.randomUUID().toString();
        }

        // Retrieve relevant context
        List<SearchResult> results = search(
                request.getQuery(),
                request.getTypes(),
                request.getTopK()
        );

        // Build context string
        String context = buildContext(results);

        // Convert to references (deduplicated by entity)
        List<RagChatResponse.Reference> references = toReferences(results);

        log.info("RAG chat - conversationId: {}, query: '{}', retrieved {} documents, {} unique references",
                conversationId, request.getQuery(), results.size(), references.size());

        // Build messages with history
        List<Message> messages = buildMessagesWithHistory(conversationId, context, request.getQuery());

        // Save user message to history
        saveMessage(conversationId, "USER", buildUserMessageContent(context, request.getQuery()));

        // Create prompt and stream response
        ChatClient chatClient = chatClientBuilder.build();
        Prompt prompt = new Prompt(messages);

        // Use StringBuilder to collect response for saving
        StringBuilder responseBuilder = new StringBuilder();
        String finalConversationId = conversationId;

        Flux<String> contentFlux = chatClient.prompt(prompt)
                .stream()
                .content()
                .doOnNext(responseBuilder::append)
                .doOnComplete(() -> {
                    // Save assistant response to history
                    saveMessage(finalConversationId, "ASSISTANT", responseBuilder.toString());
                });

        return new StreamingChatResult(contentFlux, references, conversationId);
    }

    /**
     * Perform RAG chat with streaming response (backward compatible).
     */
    public Flux<String> chat(RagChatRequest request) {
        return chatWithReferences(request).contentFlux();
    }

    /**
     * Perform RAG chat with non-streaming response including references.
     */
    @Transactional
    public RagChatResponse chatSyncWithReferences(RagChatRequest request) {
        // Generate or use existing conversationId
        String conversationId = request.getConversationId();
        if (conversationId == null || conversationId.isBlank()) {
            conversationId = UUID.randomUUID().toString();
        }

        List<SearchResult> results = search(
                request.getQuery(),
                request.getTypes(),
                request.getTopK()
        );

        String context = buildContext(results);
        List<RagChatResponse.Reference> references = toReferences(results);

        // Build messages with history
        List<Message> messages = buildMessagesWithHistory(conversationId, context, request.getQuery());

        // Save user message
        saveMessage(conversationId, "USER", buildUserMessageContent(context, request.getQuery()));

        // Get response
        ChatClient chatClient = chatClientBuilder.build();
        Prompt prompt = new Prompt(messages);
        String answer = chatClient.prompt(prompt)
                .call()
                .content();

        // Save assistant response
        saveMessage(conversationId, "ASSISTANT", answer);

        return RagChatResponse.builder()
                .answer(answer)
                .references(references)
                .conversationId(conversationId)
                .build();
    }

    /**
     * Perform RAG chat with non-streaming response (backward compatible).
     */
    public String chatSync(RagChatRequest request) {
        return chatSyncWithReferences(request).getAnswer();
    }

    /**
     * Get vector statistics.
     */
    public VectorStats getStats() {
        long totalDocuments = vectorDocumentRepository.count();
        long totalEntities = vectorDocumentRepository.countDistinctEntities();

        Map<String, Long> countsByType = new HashMap<>();
        for (String type : List.of("activity", "news", "project", "expert", "product")) {
            countsByType.put(type, vectorDocumentRepository.countByEntityType(type));
        }

        return VectorStats.builder()
                .totalDocuments(totalDocuments)
                .totalEntities(totalEntities)
                .countsByType(countsByType)
                .build();
    }

    /**
     * Build messages list including conversation history.
     */
    private List<Message> buildMessagesWithHistory(String conversationId, String context, String query) {
        List<Message> messages = new ArrayList<>();

        // Add system message
        messages.add(new SystemMessage(SYSTEM_PROMPT));

        // Load conversation history (limit to recent messages)
        List<ChatMessage> history = chatMessageRepository
                .findByConversationIdOrderByMessageIndexAsc(conversationId);

        // Take only the last N messages
        int startIdx = Math.max(0, history.size() - maxHistoryMessages);
        for (int i = startIdx; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            switch (msg.getMessageType()) {
                case "USER" -> messages.add(new UserMessage(msg.getContent()));
                case "ASSISTANT" -> messages.add(new AssistantMessage(msg.getContent()));
                case "SYSTEM" -> messages.add(new SystemMessage(msg.getContent()));
            }
        }

        // Add current user message with RAG context
        String userMessage = buildUserMessageContent(context, query);
        messages.add(new UserMessage(userMessage));

        return messages;
    }

    /**
     * Build user message content with RAG context.
     */
    private String buildUserMessageContent(String context, String query) {
        if (context == null || context.isBlank()) {
            return query;
        }
        return String.format(RAG_USER_TEMPLATE, context, query);
    }

    /**
     * Save a message to conversation history.
     */
    private void saveMessage(String conversationId, String messageType, String content) {
        try {
            Integer nextIndex = chatMessageRepository.getNextMessageIndex(conversationId);
            ChatMessage message = ChatMessage.builder()
                    .conversationId(conversationId)
                    .messageIndex(nextIndex)
                    .messageType(messageType)
                    .content(content)
                    .build();
            chatMessageRepository.save(message);
        } catch (Exception e) {
            log.error("Failed to save chat message: conversationId={}, type={}", conversationId, messageType, e);
        }
    }

    /**
     * Convert search results to references, deduplicated by entity.
     */
    private List<RagChatResponse.Reference> toReferences(List<SearchResult> results) {
        Map<String, RagChatResponse.Reference> uniqueRefs = new LinkedHashMap<>();

        for (SearchResult result : results) {
            String key = result.getEntityType() + ":" + result.getEntityId();
            if (!uniqueRefs.containsKey(key)) {
                uniqueRefs.put(key, RagChatResponse.Reference.builder()
                        .entityType(result.getEntityType())
                        .entityId(result.getEntityId())
                        .title(result.getTitle())
                        .typeName(getTypeName(result.getEntityType()))
                        .score(result.getScore())
                        .build());
            }
        }

        return new ArrayList<>(uniqueRefs.values());
    }

    private String buildContext(List<SearchResult> results) {
        StringBuilder sb = new StringBuilder();
        int charCount = 0;

        for (SearchResult result : results) {
            String entry = formatResultEntry(result);
            if (charCount + entry.length() > maxContextChars) {
                break;
            }
            sb.append(entry).append("\n\n");
            charCount += entry.length();
        }

        return sb.toString().trim();
    }

    private String formatResultEntry(SearchResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(getTypeName(result.getEntityType())).append("] ");

        if (result.getTitle() != null) {
            sb.append(result.getTitle()).append("\n");
        }

        sb.append(result.getContent());

        return sb.toString();
    }

    private String getTypeName(String entityType) {
        return switch (entityType) {
            case "activity" -> "活动";
            case "news" -> "新闻";
            case "project" -> "项目";
            case "expert" -> "专家";
            case "product" -> "产品";
            case "manufacturer" -> "厂商";
            default -> entityType;
        };
    }

    /**
     * Result holder for streaming chat with references and conversationId.
     */
    public record StreamingChatResult(
            Flux<String> contentFlux,
            List<RagChatResponse.Reference> references,
            String conversationId
    ) {}
}
