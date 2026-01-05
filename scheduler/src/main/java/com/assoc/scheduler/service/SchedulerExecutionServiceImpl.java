package com.assoc.scheduler.service;

import com.assoc.scheduler.config.SchedulerProperties;
import com.assoc.scheduler.entity.ExecutionStatus;
import com.assoc.scheduler.entity.JobExecutionLog;
import com.assoc.scheduler.entity.SchedulerJob;
import com.assoc.scheduler.handler.JobHandler;
import com.assoc.scheduler.handler.JobHandlerRegistry;
import com.assoc.scheduler.quartz.TenantAwareQuartzJob;
import com.assoc.scheduler.repository.JobExecutionLogRepository;
import com.assoc.scheduler.repository.ScheduleExcludedDateRepository;
import com.assoc.scheduler.repository.SchedulerJobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerExecutionServiceImpl implements SchedulerExecutionService {

    private final SchedulerJobRepository jobRepository;
    private final ScheduleExcludedDateRepository excludedDateRepository;
    private final JobExecutionLogRepository logRepository;
    private final JobHandlerRegistry jobHandlerRegistry;
    private final SchedulerProperties properties;
    private final Scheduler scheduler;
    private final PlatformTransactionManager transactionManager;

    @Override
    @Transactional
    public void execute(Long jobId, Long strategyId, int retryCount, JobExecutionContext context) throws Exception {
        SchedulerJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalStateException("作业不存在或已删除"));
        log.info("Executing scheduler job {} (strategy {}, retry {})", jobId,
                strategyId != null ? strategyId : job.getScheduleStrategyId(), retryCount);
        if (!Boolean.TRUE.equals(job.getEnabled())) {
            log.info("Job {} disabled, skip execution", jobId);
            recordLog(job, strategyId, context, ExecutionStatus.SKIPPED, "作业已禁用", retryCount, 0);
            return;
        }

        if (strategyId != null && excludedDateRepository.existsByStrategyIdAndExcludedDate(strategyId, LocalDate.now())) {
            log.info("Job {} skipped because strategy {} is excluded today", jobId, strategyId);
            recordLog(job, strategyId, context, ExecutionStatus.SKIPPED, "命中排除日期", retryCount, 0);
            return;
        }

        LocalDateTime start = LocalDateTime.now();
        try {
            JobHandler handler = jobHandlerRegistry.get(job.getJobType());
            handler.handle(job, context);
            int duration = (int) Duration.between(start, LocalDateTime.now()).toMillis();
            log.info("Job {} finished successfully in {} ms", jobId, duration);
            recordLog(job, strategyId, context, ExecutionStatus.SUCCESS, null, retryCount, duration);
        } catch (Exception ex) {
            int duration = (int) Duration.between(start, LocalDateTime.now()).toMillis();
            boolean scheduledRetry = scheduleRetryIfNeeded(job, strategyId, retryCount);
            log.error("Job {} failed after {} ms, scheduledRetry={}, message={}", jobId, duration, scheduledRetry, ex.getMessage(), ex);
            recordLog(job, strategyId, context,
                    scheduledRetry ? ExecutionStatus.RETRIED : ExecutionStatus.FAILED,
                    ex.getMessage(), retryCount, duration);
            throw ex;
        }
    }

    private void recordLog(SchedulerJob job,
                           Long strategyId,
                           JobExecutionContext context,
                           ExecutionStatus status,
                           String errorMessage,
                           int retryCount,
                           int durationMs) {
        JobExecutionLog logEntry = new JobExecutionLog();
        logEntry.setJobId(job.getId());
        logEntry.setStrategyId(strategyId != null ? strategyId : job.getScheduleStrategyId());
        logEntry.setScheduledFireTime(toLocalDateTime(context.getScheduledFireTime()));
        logEntry.setActualFireTime(toLocalDateTime(context.getFireTime()));
        logEntry.setFinishedTime(LocalDateTime.now());
        logEntry.setStatus(status);
        logEntry.setErrorMessage(errorMessage);
        logEntry.setRetryCount(retryCount);
        logEntry.setDurationMs(durationMs);
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        template.executeWithoutResult(statusTx -> logRepository.save(logEntry));
    }

    private boolean scheduleRetryIfNeeded(SchedulerJob job, Long strategyId, int currentRetryCount) {
        int nextRetry = currentRetryCount + 1;
        if (nextRetry > properties.getRetry().getMaxAttempts()) {
            return false;
        }
        try {
            JobKey jobKey = JobKey.jobKey("scheduler-job-" + job.getId(), "default");
            if (!scheduler.checkExists(jobKey)) {
                return false;
            }
            JobDataMap dataMap = new JobDataMap();
            dataMap.put(TenantAwareQuartzJob.RETRY_COUNT_KEY, nextRetry);
            dataMap.put(TenantAwareQuartzJob.STRATEGY_ID_KEY, strategyId != null ? strategyId : job.getScheduleStrategyId());
            dataMap.put(TenantAwareQuartzJob.JOB_ID_KEY, job.getId());
            String triggerIdentity = "scheduler-retry-" + job.getId() + "-" + System.currentTimeMillis();
            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerIdentity, "default")
                    .forJob(jobKey)
                    .startAt(Date.from(Instant.now().plus(properties.getRetry().getInterval())))
                    .withSchedule(org.quartz.SimpleScheduleBuilder.simpleSchedule()
                            .withRepeatCount(0)
                            .withMisfireHandlingInstructionFireNow())
                    .usingJobData(dataMap)
                    .build();
            scheduler.scheduleJob(trigger);
            log.info("Scheduled retry {} for job {}", nextRetry, job.getId());
            return true;
        } catch (SchedulerException ex) {
            log.error("Failed to schedule retry for job {}", job.getId(), ex);
            return false;
        }
    }

    private LocalDateTime toLocalDateTime(Date date) {
        if (date == null) {
            return LocalDateTime.now();
        }
        return LocalDateTime.ofInstant(date.toInstant(), java.time.ZoneId.systemDefault());
    }
}
