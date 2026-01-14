package com.assoc.ai.event;

import com.assoc.ai.dto.VectorChunk;
import com.assoc.ai.embedding.EmbeddingService;
import com.assoc.ai.store.VectorStore;
import com.assoc.ai.util.JsonTextExtractor;
import com.assoc.ai.util.TextChunker;
import com.assoc.common.event.VectorizeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Event listener for vectorization events.
 * Processes vectorization requests published by business modules.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VectorizeEventListener {

    private final VectorStore vectorStore;
    private final EmbeddingService embeddingService;
    private final TextChunker textChunker;

    /**
     * Handle vectorize event asynchronously.
     *
     * @param event the vectorize event
     */
    @Async
    @EventListener
    public void handleVectorizeEvent(VectorizeEvent event) {
        log.info("Received vectorize event: type={}, id={}, action={}",
                event.getEntityType(), event.getEntityId(), event.getAction());

        try {
            switch (event.getAction()) {
                case DELETE -> handleDelete(event);
                case UPSERT -> handleUpsert(event);
            }
        } catch (Exception e) {
            log.error("Failed to process vectorize event: type={}, id={}, error={}",
                    event.getEntityType(), event.getEntityId(), e.getMessage(), e);
        }
    }

    private void handleDelete(VectorizeEvent event) {
        vectorStore.deleteByEntity(event.getEntityType(), event.getEntityId());
        log.info("Deleted vectors for entity: {}/{}", event.getEntityType(), event.getEntityId());
    }

    private void handleUpsert(VectorizeEvent event) {
        // Delete existing vectors first
        vectorStore.deleteByEntity(event.getEntityType(), event.getEntityId());

        Map<String, String> fields = event.getFields();
        if (fields == null || fields.isEmpty()) {
            log.warn("No fields provided for vectorization: {}/{}", event.getEntityType(), event.getEntityId());
            return;
        }

        List<VectorChunk> allChunks = new ArrayList<>();
        AtomicInteger globalChunkIndex = new AtomicInteger(0);

        fields.forEach((fieldName, content) -> {
            if (content == null || content.isBlank()) {
                return;
            }

            // Extract text from JSON if needed
            String text = JsonTextExtractor.extractText(content);
            if (text.isBlank()) {
                return;
            }

            // Chunk the text
            List<String> textChunks = textChunker.chunk(text);

            // Generate embeddings and create vector chunks
            for (String chunkContent : textChunks) {
                try {
                    float[] embedding = embeddingService.embed(chunkContent);
                    allChunks.add(VectorChunk.builder()
                            .chunkIndex(globalChunkIndex.getAndIncrement())
                            .fieldSource(fieldName)
                            .content(chunkContent)
                            .embedding(embedding)
                            .metadata(event.getMetadata())
                            .build());
                } catch (Exception e) {
                    log.warn("Failed to embed chunk for field '{}': {}", fieldName, e.getMessage());
                }
            }
        });

        if (!allChunks.isEmpty()) {
            vectorStore.save(event.getEntityType(), event.getEntityId(), allChunks);
            log.info("Saved {} vector chunks for entity: {}/{}",
                    allChunks.size(), event.getEntityType(), event.getEntityId());
        }
    }
}
