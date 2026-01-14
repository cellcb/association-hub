package com.assoc.ai.embedding;

import java.util.List;

/**
 * Interface for embedding service operations.
 */
public interface EmbeddingService {

    /**
     * Generate embedding for a single text.
     *
     * @param text the text to embed
     * @return the embedding vector
     */
    float[] embed(String text);

    /**
     * Generate embeddings for multiple texts in batch.
     *
     * @param texts list of texts to embed
     * @return list of embedding vectors
     */
    List<float[]> embedBatch(List<String> texts);
}
