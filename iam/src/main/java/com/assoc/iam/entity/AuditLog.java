package com.assoc.iam.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "iam_audit_log")
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class AuditLog extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(name = "roles", columnDefinition = "TEXT")
    private String roles;

    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "resource", length = 100)
    private String resource;

    @Column(name = "remark", length = 255)
    private String remark;

    @Column(name = "request_uri", length = 500)
    private String requestUri;

    @Column(name = "http_method", length = 20)
    private String httpMethod;

    @Column(name = "client_ip", length = 64)
    private String clientIp;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;

    @Column(name = "result_status", length = 32)
    private String resultStatus;

    @Column(name = "result_message", columnDefinition = "TEXT")
    private String resultMessage;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "occurred_at")
    private OffsetDateTime occurredAt;
}
