package com.assoc.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for RAG chat.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatRequest {

    /**
     * User's question
     */
    private String query;

    /**
     * Entity types to search (null for all)
     */
    private List<String> types;

    /**
     * Number of top results to retrieve
     */
    @Builder.Default
    private Integer topK = 8;

    /**
     * Whether to use streaming response
     */
    @Builder.Default
    private Boolean stream = true;

    /**
     * Conversation ID for multi-turn chat (optional, null creates new conversation)
     */
    private String conversationId;
}
