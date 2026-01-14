package com.assoc.ai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Unified vector document entity for storing vectors of all entity types.
 */
@Entity
@Table(name = "ai_vector_document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Entity type: activity, news, project, expert, product
     */
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    /**
     * Original entity ID from the business module
     */
    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    /**
     * Chunk index for multi-chunk documents
     */
    @Column(name = "chunk_index", nullable = false)
    @Builder.Default
    private Integer chunkIndex = 0;

    /**
     * Chunked text content
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * Source field name: title, description, etc.
     */
    @Column(name = "field_source", length = 50)
    private String fieldSource;

    /**
     * Vector embedding (stored as float array, mapped to pgvector)
     */
    @Column(name = "embedding", columnDefinition = "vector(512)", nullable = false)
    private float[] embedding;

    /**
     * JSON metadata for search result display
     */
    @Column(columnDefinition = "JSONB")
    private String metadata;

    /**
     * Creation timestamp
     */
    @Column(name = "created_time")
    @Builder.Default
    private LocalDateTime createdTime = LocalDateTime.now();
}
