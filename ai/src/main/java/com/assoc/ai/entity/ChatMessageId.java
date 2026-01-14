package com.assoc.ai.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Composite primary key for ChatMessage entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageId implements Serializable {
    private String conversationId;
    private Integer messageIndex;
}
