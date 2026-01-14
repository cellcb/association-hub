package com.assoc.ai.controller;

import com.assoc.ai.dto.PublicRagChatRequest;
import com.assoc.ai.dto.RagChatRequest;
import com.assoc.ai.service.RagService;
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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Public RAG API controller for website visitors.
 * No authentication required.
 */
@Slf4j
@RestController
@RequestMapping("/api/public/rag")
@RequiredArgsConstructor
@Tag(name = "Public RAG", description = "Public RAG API for website visitors")
public class PublicRagController {

    private final RagService ragService;
    private final ObjectMapper objectMapper;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    private static final int DEFAULT_TOP_K = 5;

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Public RAG chat (streaming)", description = "Chat with RAG using streaming response, no authentication required")
    public SseEmitter chat(@RequestBody PublicRagChatRequest request) {
        SseEmitter emitter = new SseEmitter(300_000L);

        executor.execute(() -> {
            try {
                // Convert to internal RagChatRequest
                RagChatRequest ragRequest = new RagChatRequest();
                ragRequest.setQuery(request.getQuery());
                ragRequest.setTypes(request.getTypes());
                ragRequest.setTopK(DEFAULT_TOP_K);
                ragRequest.setConversationId(request.getConversationId());

                // Get streaming result with references
                RagService.StreamingChatResult result = ragService.chatWithReferences(ragRequest);

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
                        .blockLast();

            } catch (Exception e) {
                log.error("Error in public SSE streaming", e);
                emitter.completeWithError(e);
            }
        });

        // Set timeout and error callbacks
        emitter.onTimeout(() -> log.warn("Public SSE connection timed out"));
        emitter.onError(e -> log.error("Public SSE error", e));

        return emitter;
    }
}
