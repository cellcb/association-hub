package com.assoc.iam.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.assoc.common.audit.AuditAction;
import com.assoc.common.audit.AuditContext;
import com.assoc.common.audit.AuditResultStatus;
import com.assoc.common.context.RequestContext;
import com.assoc.iam.dto.AuditLogQueryRequest;
import com.assoc.iam.dto.AuditLogResponse;
import com.assoc.iam.entity.AuditLog;
import com.assoc.iam.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final RequestContext requestContext;

    @Transactional
    public void record(AuditContext context) {
        if (context == null) {
            log.warn("AuditContext is null, skipping persistence");
            return;
        }

        if (context.getUserId() != null) {
            requestContext.setCurrentUserId(context.getUserId());
        }
        if (context.getUsername() != null) {
            requestContext.setCurrentUsername(context.getUsername());
        }

        AuditLog entity = toEntity(context);
        auditLogRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> search(AuditLogQueryRequest request, Pageable pageable) {
        final AuditLogQueryRequest queryRequest = request != null ? request : new AuditLogQueryRequest();

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(queryRequest.getAction())) {
                predicates.add(cb.equal(root.get("action"), queryRequest.getAction()));
            }
            if (StringUtils.hasText(queryRequest.getResource())) {
                predicates.add(cb.equal(root.get("resource"), queryRequest.getResource()));
            }
            if (StringUtils.hasText(queryRequest.getUsername())) {
                predicates.add(cb.equal(root.get("username"), queryRequest.getUsername()));
            }
            if (queryRequest.getResultStatus() != null) {
                predicates.add(cb.equal(root.get("resultStatus"), queryRequest.getResultStatus().name()));
            }
            if (queryRequest.getStartTime() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), queryRequest.getStartTime()));
            }
            if (queryRequest.getEndTime() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), queryRequest.getEndTime()));
            }

            query.orderBy(cb.desc(root.get("occurredAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public long deleteOlderThan(OffsetDateTime cutoff) {
        return auditLogRepository.deleteByOccurredAtBefore(cutoff);
    }

    private AuditLog toEntity(AuditContext context) {
        AuditLog entity = new AuditLog();
        entity.setUserId(context.getUserId());
        entity.setUsername(context.getUsername());
        entity.setRoles(serializeList(context.getRoles()));
        entity.setPermissions(serializeList(context.getPermissions()));
        entity.setAction(resolveAction(context.getAction()));
        entity.setResource(context.getResource());
        entity.setRemark(context.getRemark());
        entity.setRequestUri(context.getRequestUri());
        entity.setHttpMethod(context.getHttpMethod());
        entity.setClientIp(context.getClientIp());
        entity.setUserAgent(context.getUserAgent());
        entity.setParameters(context.getParameters());
        entity.setResultStatus(context.getResultStatus() != null ? context.getResultStatus().name() : null);
        entity.setResultMessage(context.getResultMessage());
        entity.setLatencyMs(context.getLatencyMs());
        entity.setOccurredAt(context.getOccurredAt() != null ? context.getOccurredAt() : OffsetDateTime.now());
        return entity;
    }

    private AuditLogResponse toResponse(AuditLog entity) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUserId());
        response.setUsername(entity.getUsername());
        response.setRoles(deserializeList(entity.getRoles()));
        response.setPermissions(deserializeList(entity.getPermissions()));
        response.setAction(entity.getAction());
        response.setResource(entity.getResource());
        response.setRemark(entity.getRemark());
        response.setRequestUri(entity.getRequestUri());
        response.setHttpMethod(entity.getHttpMethod());
        response.setClientIp(entity.getClientIp());
        response.setUserAgent(entity.getUserAgent());
        response.setParameters(entity.getParameters());
        response.setResultStatus(resolveStatus(entity.getResultStatus()));
        response.setResultMessage(entity.getResultMessage());
        response.setLatencyMs(entity.getLatencyMs());
        response.setOccurredAt(entity.getOccurredAt());
        return response;
    }

    private String serializeList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize list {}, error: {}", values, e.getMessage());
            return String.join(",", values);
        }
    }

    private List<String> deserializeList(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        try {
            return objectMapper.readValue(value, new TypeReference<>() {
            });
        } catch (Exception e) {
            log.warn("Failed to deserialize list from '{}': {}", value, e.getMessage());
            return List.of(value);
        }
    }

    private String resolveAction(String action) {
        if (StringUtils.hasText(action)) {
            return action;
        }
        return AuditAction.UNKNOWN.getCode();
    }

    private AuditResultStatus resolveStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }
        try {
            return AuditResultStatus.valueOf(status);
        } catch (IllegalArgumentException ex) {
            log.warn("Unknown audit result status: {}", status);
            return null;
        }
    }
}
