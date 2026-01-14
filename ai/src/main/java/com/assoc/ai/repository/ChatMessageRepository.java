package com.assoc.ai.repository;

import com.assoc.ai.entity.ChatMessage;
import com.assoc.ai.entity.ChatMessageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ChatMessage entity.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, ChatMessageId> {

    /**
     * Find all messages for a conversation, ordered by message index.
     */
    List<ChatMessage> findByConversationIdOrderByMessageIndexAsc(String conversationId);

    /**
     * Get the next message index for a conversation.
     */
    @Query("SELECT COALESCE(MAX(m.messageIndex), -1) + 1 FROM ChatMessage m WHERE m.conversationId = :conversationId")
    Integer getNextMessageIndex(String conversationId);

    /**
     * Delete all messages for a conversation.
     */
    void deleteByConversationId(String conversationId);

    /**
     * Count messages in a conversation.
     */
    long countByConversationId(String conversationId);
}
