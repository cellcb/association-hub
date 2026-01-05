package com.assoc.audit;

import com.assoc.config.AuditProperties;
import com.assoc.iam.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditRetentionScheduler {

    private final AuditLogService auditLogService;
    private final AuditProperties auditProperties;

    @Scheduled(cron = "${audit.retention-cron:0 30 3 * * *}")
    public void purgeExpired() {
        int retentionDays = auditProperties.getRetentionDays();
        if (retentionDays <= 0) {
            log.debug("Audit retention disabled via configuration");
            return;
        }

        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(retentionDays);
        try {
            long deleted = auditLogService.deleteOlderThan(cutoff);
            if (deleted > 0) {
                log.info("Audit retention cleaned {} records before {}", deleted, cutoff);
            }
        } catch (Exception ex) {
            log.warn("Audit retention failed: {}", ex.getMessage());
        }
    }
}
