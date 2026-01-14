package com.assoc.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO representing a single vector chunk.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorChunk {

    /**
     * Chunk index within the document
     */
    private Integer chunkIndex;

    /**
     * Source field name
     */
    private String fieldSource;

    /**
     * Text content of the chunk
     */
    private String content;

    /**
     * Vector embedding
     */
    private float[] embedding;

    /**
     * Metadata for search result display
     */
    private Map<String, Object> metadata;
}
