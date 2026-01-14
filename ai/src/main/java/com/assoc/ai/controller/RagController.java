package com.assoc.ai.controller;

import com.assoc.ai.dto.RagChatRequest;
import com.assoc.ai.dto.RagChatResponse;
import com.assoc.ai.dto.SearchResult;
import com.assoc.ai.service.RagService;
import com.assoc.common.Result;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * RAG (Retrieval Augmented Generation) API controller.
 */
@Slf4j
@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
@Tag(name = "RAG", description = "Retrieval Augmented Generation API")
public class RagController {

    private final RagService ragService;
    private final ObjectMapper objectMapper;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    @GetMapping("/search")
    @Operation(summary = "Semantic search", description = "Search for relevant content using hybrid search")
    public Result<List<SearchResult>> search(
            @RequestParam String query,
            @RequestParam(required = false) List<String> types,
            @RequestParam(defaultValue = "10") int topK) {
        List<SearchResult> results = ragService.search(query, types, topK);
        return Result.success(results);
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "RAG chat (streaming)", description = "Chat with RAG using streaming response with references")
    public SseEmitter chatStream(@RequestBody RagChatRequest request) {
        // 设置超时时间为 5 分钟
        SseEmitter emitter = new SseEmitter(300_000L);

        executor.execute(() -> {
            try {
                // Get streaming result with references
                RagService.StreamingChatResult result = ragService.chatWithReferences(request);

                // 1. Send meta event with conversationId
                try {
                    String metaJson = objectMapper.writeValueAsString(
                            java.util.Map.of("conversationId", result.conversationId()));
                    SseEmitter.SseEventBuilder metaEvent = SseEmitter.event()
                            .name("meta")
                            .data(metaJson, MediaType.APPLICATION_JSON);
                    emitter.send(metaEvent);
                } catch (JsonProcessingException e) {
                    log.error("Error serializing meta", e);
                }

                // 2. Send references event
                try {
                    String referencesJson = objectMapper.writeValueAsString(result.references());
                    SseEmitter.SseEventBuilder refEvent = SseEmitter.event()
                            .name("references")
                            .data(referencesJson, MediaType.APPLICATION_JSON);
                    emitter.send(refEvent);
                } catch (JsonProcessingException e) {
                    log.error("Error serializing references", e);
                }

                // 3. Stream content events
                result.contentFlux()
                        .doOnNext(content -> {
                            try {
                                SseEmitter.SseEventBuilder event = SseEmitter.event()
                                        .name("content")
                                        .data(content, MediaType.valueOf("text/plain;charset=UTF-8"));
                                emitter.send(event);
                            } catch (IOException e) {
                                log.error("Error sending SSE content event", e);
                                emitter.completeWithError(e);
                            }
                        })
                        .doOnComplete(() -> {
                            try {
                                // 4. Send done event
                                SseEmitter.SseEventBuilder doneEvent = SseEmitter.event()
                                        .name("done")
                                        .data("");
                                emitter.send(doneEvent);
                                emitter.complete();
                            } catch (IOException e) {
                                log.error("Error sending done event", e);
                                emitter.completeWithError(e);
                            }
                        })
                        .doOnError(emitter::completeWithError)
                        .blockLast();  // 阻塞等待 Flux 完成

            } catch (Exception e) {
                log.error("Error in SSE streaming", e);
                emitter.completeWithError(e);
            }
        });

        // 设置超时和错误回调
        emitter.onTimeout(() -> log.warn("SSE connection timed out"));
        emitter.onError(e -> log.error("SSE error", e));

        return emitter;
    }

    @PostMapping("/chat/sync")
    @Operation(summary = "RAG chat (synchronous)", description = "Chat with RAG with complete response including references")
    public Result<RagChatResponse> chatSync(@RequestBody RagChatRequest request) {
        RagChatResponse response = ragService.chatSyncWithReferences(request);
        return Result.success(response);
    }
}
