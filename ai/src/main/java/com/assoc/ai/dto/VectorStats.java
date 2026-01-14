package com.assoc.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for vector statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorStats {

    /**
     * Total number of vector documents
     */
    private Long totalDocuments;

    /**
     * Total number of unique entities
     */
    private Long totalEntities;

    /**
     * Document counts by entity type
     */
    private Map<String, Long> countsByType;
}
