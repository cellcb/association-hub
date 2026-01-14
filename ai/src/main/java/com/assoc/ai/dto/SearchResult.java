package com.assoc.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO representing a search result.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResult {

    /**
     * Entity type: activity, news, project, expert, product
     */
    private String entityType;

    /**
     * Original entity ID
     */
    private Long entityId;

    /**
     * Title from metadata
     */
    private String title;

    /**
     * Matched content
     */
    private String content;

    /**
     * Source field name
     */
    private String fieldSource;

    /**
     * Relevance score (0-1)
     */
    private Double score;

    /**
     * Additional metadata
     */
    private Map<String, Object> metadata;
}
