-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Unified vector document table for all entity types
CREATE TABLE IF NOT EXISTS ai_vector_document (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,   -- activity/news/project/expert/product
    entity_id BIGINT NOT NULL,          -- Original entity ID
    chunk_index INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL,              -- Chunked text content
    field_source VARCHAR(50),           -- Source field: title/description/etc
    embedding vector(512) NOT NULL,     -- Vector data (512 dimensions for bge-small-zh-1.5)
    metadata JSONB,                     -- Extended metadata (title, summary, etc.)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce(content, ''))
    ) STORED,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_ai_vector_chunk UNIQUE (entity_type, entity_id, chunk_index, field_source)
);

-- Indexes
CREATE INDEX idx_ai_vector_entity ON ai_vector_document(entity_type, entity_id);
CREATE INDEX idx_ai_vector_type ON ai_vector_document(entity_type);
CREATE INDEX idx_ai_vector_embedding ON ai_vector_document
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_ai_vector_fts ON ai_vector_document USING gin(search_vector);

-- Comments
COMMENT ON TABLE ai_vector_document IS 'Unified vector document table storing vectors for all entity types';
COMMENT ON COLUMN ai_vector_document.entity_type IS 'Entity type: activity/news/project/expert/product';
COMMENT ON COLUMN ai_vector_document.entity_id IS 'Original entity ID, corresponds to primary key in respective module tables';
COMMENT ON COLUMN ai_vector_document.metadata IS 'JSON metadata containing title, summary etc. for search result display';
