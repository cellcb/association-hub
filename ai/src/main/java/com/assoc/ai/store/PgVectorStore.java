package com.assoc.ai.store;

import com.assoc.ai.dto.SearchResult;
import com.assoc.ai.dto.VectorChunk;
import com.assoc.ai.entity.VectorDocument;
import com.assoc.ai.repository.VectorDocumentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * pgvector implementation of VectorStore.
 * Uses PostgreSQL with pgvector extension for vector storage and similarity search.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ai.vector.store.type", havingValue = "pgvector", matchIfMissing = true)
public class PgVectorStore implements VectorStore {

    private final VectorDocumentRepository repository;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void save(String entityType, Long entityId, List<VectorChunk> chunks) {
        if (chunks == null || chunks.isEmpty()) {
            log.debug("No chunks to save for entity: {}/{}", entityType, entityId);
            return;
        }

        List<VectorDocument> documents = chunks.stream()
                .map(chunk -> VectorDocument.builder()
                        .entityType(entityType)
                        .entityId(entityId)
                        .chunkIndex(chunk.getChunkIndex())
                        .fieldSource(chunk.getFieldSource())
                        .content(chunk.getContent())
                        .embedding(chunk.getEmbedding())
                        .metadata(serializeMetadata(chunk.getMetadata()))
                        .build())
                .collect(Collectors.toList());

        // Use native query for pgvector support
        for (VectorDocument doc : documents) {
            saveWithNativeQuery(doc);
        }

        log.info("Saved {} vector chunks for entity: {}/{}", chunks.size(), entityType, entityId);
    }

    private void saveWithNativeQuery(VectorDocument doc) {
        // Use CAST function instead of :: to avoid parameter binding issues with Hibernate
        String sql = """
            INSERT INTO ai_vector_document
            (entity_type, entity_id, chunk_index, content, field_source, embedding, metadata, created_time)
            VALUES (?1, ?2, ?3, ?4, ?5, CAST(?6 AS vector), CAST(?7 AS jsonb), NOW())
            ON CONFLICT (entity_type, entity_id, chunk_index, field_source)
            DO UPDATE SET content = ?4, embedding = CAST(?6 AS vector), metadata = CAST(?7 AS jsonb)
            """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter(1, doc.getEntityType());
        query.setParameter(2, doc.getEntityId());
        query.setParameter(3, doc.getChunkIndex());
        query.setParameter(4, doc.getContent());
        query.setParameter(5, doc.getFieldSource());
        query.setParameter(6, vectorToString(doc.getEmbedding()));
        query.setParameter(7, doc.getMetadata());
        query.executeUpdate();
    }

    @Override
    @Transactional
    public void deleteByEntity(String entityType, Long entityId) {
        repository.deleteByEntityTypeAndEntityId(entityType, entityId);
        log.info("Deleted vectors for entity: {}/{}", entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchResult> similaritySearch(float[] queryVector, List<String> entityTypes, int topK) {
        String typeFilter = (entityTypes != null && !entityTypes.isEmpty())
                ? "AND entity_type = ANY(?3)"
                : "";

        String sql = """
            SELECT entity_type, entity_id, content, field_source, metadata,
                   1 - (embedding <=> CAST(?1 AS vector)) AS score
            FROM ai_vector_document
            WHERE 1=1 %s
            ORDER BY embedding <=> CAST(?1 AS vector)
            LIMIT ?2
            """.formatted(typeFilter);

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter(1, vectorToString(queryVector));
        query.setParameter(2, topK);

        if (entityTypes != null && !entityTypes.isEmpty()) {
            query.setParameter(3, entityTypes.toArray(new String[0]));
        }

        return mapToSearchResults(query.getResultList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchResult> hybridSearch(float[] queryVector, String query, List<String> entityTypes, int topK) {
        String typeFilter = (entityTypes != null && !entityTypes.isEmpty())
                ? "AND entity_type = ANY(?5)"
                : "";
        String textTypeFilter = (entityTypes != null && !entityTypes.isEmpty())
                ? "AND entity_type = ANY(?5)"
                : "";

        // Hybrid search: vector similarity (0.7) + full-text search (0.3)
        String sql = """
            WITH vector_search AS (
                SELECT id, entity_type, entity_id, content, field_source, metadata,
                       1 - (embedding <=> CAST(?1 AS vector)) AS vector_score
                FROM ai_vector_document
                WHERE 1=1 %s
                ORDER BY embedding <=> CAST(?1 AS vector)
                LIMIT ?3
            ),
            text_search AS (
                SELECT id, entity_type, entity_id, content, field_source, metadata,
                       ts_rank(search_vector, plainto_tsquery('simple', ?2)) AS text_score
                FROM ai_vector_document
                WHERE search_vector @@ plainto_tsquery('simple', ?2)
                %s
                LIMIT ?3
            )
            SELECT COALESCE(v.entity_type, t.entity_type) AS entity_type,
                   COALESCE(v.entity_id, t.entity_id) AS entity_id,
                   COALESCE(v.content, t.content) AS content,
                   COALESCE(v.field_source, t.field_source) AS field_source,
                   COALESCE(v.metadata, t.metadata) AS metadata,
                   (COALESCE(v.vector_score, 0) * 0.7 + COALESCE(t.text_score, 0) * 0.3) AS score
            FROM vector_search v
            FULL OUTER JOIN text_search t ON v.id = t.id
            ORDER BY score DESC
            LIMIT ?4
            """.formatted(typeFilter, textTypeFilter);

        Query nativeQuery = entityManager.createNativeQuery(sql);
        nativeQuery.setParameter(1, vectorToString(queryVector));
        nativeQuery.setParameter(2, query);
        nativeQuery.setParameter(3, topK * 2);
        nativeQuery.setParameter(4, topK);

        if (entityTypes != null && !entityTypes.isEmpty()) {
            nativeQuery.setParameter(5, entityTypes.toArray(new String[0]));
        }

        return mapToSearchResults(nativeQuery.getResultList());
    }

    private String vectorToString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    private String serializeMetadata(Map<String, Object> metadata) {
        if (metadata == null) return null;
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize metadata", e);
            return null;
        }
    }

    private Map<String, Object> deserializeMetadata(String metadata) {
        if (metadata == null) return null;
        try {
            return objectMapper.readValue(metadata, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize metadata", e);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private List<SearchResult> mapToSearchResults(List<?> results) {
        List<SearchResult> searchResults = new ArrayList<>();
        for (Object row : results) {
            Object[] cols = (Object[]) row;
            String title = null;
            Map<String, Object> metadata = deserializeMetadata((String) cols[4]);
            if (metadata != null) {
                // 优先使用 name（适用于专家、产品），其次使用 title（适用于活动、新闻、项目）
                Object nameValue = metadata.get("name");
                Object titleValue = metadata.get("title");
                if (nameValue != null && !nameValue.toString().isBlank()) {
                    title = nameValue.toString();
                } else if (titleValue != null && !titleValue.toString().isBlank()) {
                    title = titleValue.toString();
                }
            }

            searchResults.add(SearchResult.builder()
                    .entityType((String) cols[0])
                    .entityId(((Number) cols[1]).longValue())
                    .content((String) cols[2])
                    .fieldSource((String) cols[3])
                    .metadata(metadata)
                    .title(title)
                    .score(((Number) cols[5]).doubleValue())
                    .build());
        }
        return searchResults;
    }
}
