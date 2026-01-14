package com.assoc.ai.dto;

import lombok.Data;

import java.util.List;

/**
 * Public RAG chat request DTO.
 * Simplified request for public access without authentication.
 */
@Data
public class PublicRagChatRequest {

    /**
     * User's question or query.
     */
    private String query;

    /**
     * Optional entity types to filter (activity, news, project, expert, product).
     */
    private List<String> types;

    /**
     * Optional conversation ID for multi-turn dialogue.
     * If null, a new conversation will be created.
     */
    private String conversationId;
}
