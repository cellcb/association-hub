package com.assoc.common.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Context captured for an auditable operation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditContext {
    private Long userId;
    private String username;
    private List<String> roles;
    private List<String> permissions;

    private String action;
    private String resource;
    private String remark;

    private String requestUri;
    private String httpMethod;
    private String clientIp;
    private String userAgent;
    /**
     * JSON string containing sanitized parameters.
     */
    private String parameters;

    private AuditResultStatus resultStatus;
    private String resultMessage;
    private Long latencyMs;
    private OffsetDateTime occurredAt;
}
