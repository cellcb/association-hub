package com.assoc.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for RAG chat, including answer and source references.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatResponse {

    /**
     * LLM generated answer
     */
    private String answer;

    /**
     * Source references used to generate the answer
     */
    private List<Reference> references;

    /**
     * Conversation ID for multi-turn chat
     */
    private String conversationId;

    /**
     * Reference information for source tracking and navigation.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reference {

        /**
         * Entity type: activity, news, project, expert, product
         */
        private String entityType;

        /**
         * Original entity ID for navigation
         */
        private Long entityId;

        /**
         * Title of the referenced content
         */
        private String title;

        /**
         * Chinese name of the entity type (e.g., "活动", "新闻")
         */
        private String typeName;

        /**
         * Relevance score (0-1)
         */
        private Double score;
    }
}
