package com.assoc.ai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for storing RAG chat conversation history.
 */
@Entity
@Table(name = "ai_chat_memory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ChatMessageId.class)
public class ChatMessage {

    @Id
    @Column(name = "conversation_id", nullable = false)
    private String conversationId;

    @Id
    @Column(name = "message_index", nullable = false)
    private Integer messageIndex;

    @Column(name = "message_type", nullable = false, length = 50)
    private String messageType;  // USER, ASSISTANT, SYSTEM

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
