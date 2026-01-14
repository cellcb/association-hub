package com.assoc.ai.store;

import com.assoc.ai.dto.SearchResult;
import com.assoc.ai.dto.VectorChunk;

import java.util.List;

/**
 * Interface for vector storage operations.
 * Designed for easy replacement with different implementations (pgvector, Milvus, etc.).
 */
public interface VectorStore {

    /**
     * Save vector chunks for an entity.
     *
     * @param entityType the type of entity (activity, news, project, expert, product)
     * @param entityId   the entity ID
     * @param chunks     list of vector chunks to save
     */
    void save(String entityType, Long entityId, List<VectorChunk> chunks);

    /**
     * Delete all vectors for an entity.
     *
     * @param entityType the type of entity
     * @param entityId   the entity ID
     */
    void deleteByEntity(String entityType, Long entityId);

    /**
     * Perform pure vector similarity search.
     *
     * @param queryVector the query vector
     * @param entityTypes list of entity types to search (null for all)
     * @param topK        maximum number of results
     * @return list of search results ordered by similarity
     */
    List<SearchResult> similaritySearch(float[] queryVector, List<String> entityTypes, int topK);

    /**
     * Perform hybrid search combining vector similarity and full-text search.
     *
     * @param queryVector the query vector
     * @param query       the text query for full-text search
     * @param entityTypes list of entity types to search (null for all)
     * @param topK        maximum number of results
     * @return list of search results ordered by combined score
     */
    List<SearchResult> hybridSearch(float[] queryVector, String query, List<String> entityTypes, int topK);
}
