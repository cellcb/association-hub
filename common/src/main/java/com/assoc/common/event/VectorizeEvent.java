package com.assoc.common.event;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * Event for vectorization operations.
 * Published by business modules (activity, cms, product) and consumed by ai module.
 * This enables loose coupling between modules through event-driven architecture.
 */
@Data
@Builder
public class VectorizeEvent {

    /**
     * Entity type: activity, news, project, expert, product
     */
    private String entityType;

    /**
     * Original entity ID
     */
    private Long entityId;

    /**
     * Action to perform
     */
    private EventAction action;

    /**
     * Field name -> content mapping (required for UPSERT action)
     */
    private Map<String, String> fields;

    /**
     * Metadata for search result display (title, type, etc.)
     */
    private Map<String, Object> metadata;

    public enum EventAction {
        /**
         * Create or update vectors
         */
        UPSERT,

        /**
         * Delete vectors
         */
        DELETE
    }
}
