package com.assoc.audit;

import com.assoc.common.audit.AuditEvent;
import com.assoc.iam.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogService auditLogService;

    @Async("auditEventExecutor")
    @EventListener
    public void handleAuditEvent(AuditEvent event) {
        if (event == null || event.getContext() == null) {
            log.warn("Received empty audit event");
            return;
        }
        try {
            auditLogService.record(event.getContext());
        } catch (Exception ex) {
            log.warn("Failed to persist audit log for action={}, resource={}, error={}",
                    event.getContext().getAction(), event.getContext().getResource(), ex.getMessage(), ex);
        }
    }
}
