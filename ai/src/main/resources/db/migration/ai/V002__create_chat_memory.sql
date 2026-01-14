-- Spring AI JDBC ChatMemory table
-- Used for multi-turn RAG conversation support

CREATE TABLE IF NOT EXISTS ai_chat_memory (
    conversation_id VARCHAR(255) NOT NULL,
    message_index INTEGER NOT NULL,
    message_type VARCHAR(50) NOT NULL,    -- USER, ASSISTANT, SYSTEM
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, message_index)
);

CREATE INDEX idx_ai_chat_memory_conv ON ai_chat_memory(conversation_id);

COMMENT ON TABLE ai_chat_memory IS 'RAG多轮对话历史存储';
COMMENT ON COLUMN ai_chat_memory.conversation_id IS '会话ID';
COMMENT ON COLUMN ai_chat_memory.message_index IS '消息序号';
COMMENT ON COLUMN ai_chat_memory.message_type IS '消息类型: USER/ASSISTANT/SYSTEM';
COMMENT ON COLUMN ai_chat_memory.content IS '消息内容';
