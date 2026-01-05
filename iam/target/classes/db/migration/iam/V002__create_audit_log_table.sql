-- Audit log table to capture user operations for compliance and troubleshooting.
CREATE TABLE iam_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(100),
    roles TEXT,
    permissions TEXT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    remark VARCHAR(255),
    request_uri VARCHAR(500),
    http_method VARCHAR(20),
    client_ip VARCHAR(64),
    user_agent VARCHAR(255),
    parameters TEXT,
    result_status VARCHAR(32),
    result_message TEXT,
    latency_ms BIGINT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

CREATE INDEX idx_iam_audit_log_time ON iam_audit_log (occurred_at DESC);
CREATE INDEX idx_iam_audit_log_action_resource ON iam_audit_log (action, resource);
CREATE INDEX idx_iam_audit_log_user ON iam_audit_log (user_id);
