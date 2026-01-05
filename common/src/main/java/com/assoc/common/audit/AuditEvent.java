package com.assoc.common.audit;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Application event carrying audit context for asynchronous persistence.
 */
@Getter
@RequiredArgsConstructor
public class AuditEvent {
    private final AuditContext context;
}
