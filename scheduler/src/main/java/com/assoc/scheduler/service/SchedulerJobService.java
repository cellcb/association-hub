package com.assoc.scheduler.service;

import com.assoc.common.context.RequestContext;
import com.assoc.scheduler.entity.ScheduleStrategy;
import com.assoc.scheduler.entity.SchedulerJob;
import com.assoc.scheduler.quartz.TenantAwareQuartzJob;
import com.assoc.scheduler.repository.ScheduleStrategyRepository;
import com.assoc.scheduler.repository.SchedulerJobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.TimeZone;

/**
 * Manages scheduler jobs and keeps them in sync with Quartz definitions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerJobService {

    private final SchedulerJobRepository jobRepository;
    private final ScheduleStrategyRepository strategyRepository;
    private final Scheduler scheduler;
    private final RequestContext requestContext;

    @Transactional
    public SchedulerJob createJob(SchedulerJob job) {
        ensureStrategyExists(job.getScheduleStrategyId());
        log.info("Creating scheduler job '{}' using strategy {}", job.getName(), job.getScheduleStrategyId());
        SchedulerJob saved = jobRepository.save(job);
        if (Boolean.TRUE.equals(saved.getEnabled())) {
            scheduleOrUpdateJob(saved);
        }
        return saved;
    }

    @Transactional
    public List<SchedulerJob> listJobs() {
        return jobRepository.findAll();
    }

    @Transactional
    public SchedulerJob getJob(Long id) {
        return getJobForCurrentTenant(id);
    }

    @Transactional
    public SchedulerJob updateJob(Long id, SchedulerJob update) {
        SchedulerJob existing = getJobForCurrentTenant(id);
        log.info("Updating scheduler job {}", id);
        existing.setName(update.getName());
        existing.setDescription(update.getDescription());
        existing.setJobType(update.getJobType());
        existing.setJobConfig(update.getJobConfig());
        existing.setScheduleStrategyId(update.getScheduleStrategyId());
        existing.setPreconditionConfig(update.getPreconditionConfig());
        existing.setEnabled(update.getEnabled());
        ensureStrategyExists(existing.getScheduleStrategyId());
        SchedulerJob saved = jobRepository.save(existing);
        if (Boolean.TRUE.equals(saved.getEnabled())) {
            scheduleOrUpdateJob(saved);
        } else {
            unscheduleJob(saved);
        }
        return saved;
    }

    @Transactional
    public void deleteJob(Long id) {
        SchedulerJob job = getJobForCurrentTenant(id);
        log.info("Deleting scheduler job {}", id);
        unscheduleJob(job);
        jobRepository.delete(job);
    }

    @Transactional
    public void enableJob(Long id) {
        SchedulerJob job = getJobForCurrentTenant(id);
        job.setEnabled(true);
        log.info("Enabling scheduler job {}", id);
        SchedulerJob saved = jobRepository.save(job);
        scheduleOrUpdateJob(saved);
    }

    @Transactional
    public void disableJob(Long id) {
        SchedulerJob job = getJobForCurrentTenant(id);
        job.setEnabled(false);
        log.info("Disabling scheduler job {}", id);
        SchedulerJob saved = jobRepository.save(job);
        unscheduleJob(saved);
    }

    @Transactional
    public void rescheduleJobsForStrategy(Long strategyId) {
        log.info("Rescheduling jobs for strategy {}", strategyId);
        List<SchedulerJob> jobs = jobRepository.findByScheduleStrategyId(strategyId);
        for (SchedulerJob job : jobs) {
            if (Boolean.TRUE.equals(job.getEnabled())) {
                scheduleOrUpdateJob(job);
            } else {
                unscheduleJob(job);
            }
        }
    }

    private SchedulerJob getJobForCurrentTenant(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Scheduler job {} not found", id);
                    return new IllegalArgumentException("未找到对应的调度作业");
                });
    }

    private void ensureStrategyExists(Long strategyId) {
        strategyRepository.findById(strategyId)
                .orElseThrow(() -> new IllegalArgumentException("关联的调度策略不存在"));
    }

    private void scheduleOrUpdateJob(SchedulerJob job) {
        try {
            ScheduleStrategy strategy = strategyRepository.findById(job.getScheduleStrategyId())
                    .orElseThrow(() -> new IllegalStateException("未找到关联的调度策略"));
            JobKey jobKey = jobKey(job);
            TriggerKey triggerKey = triggerKey(job);
            log.info("Registering Quartz job {}, strategy {}", job.getId(), job.getScheduleStrategyId());

            JobDataMap jobDataMap = new JobDataMap();
            jobDataMap.put(TenantAwareQuartzJob.JOB_ID_KEY, job.getId());
            jobDataMap.put(TenantAwareQuartzJob.STRATEGY_ID_KEY, job.getScheduleStrategyId());
            jobDataMap.put(TenantAwareQuartzJob.JOB_TYPE_KEY, job.getJobType().name());
            jobDataMap.put(TenantAwareQuartzJob.RETRY_COUNT_KEY, 0);

            JobDetail jobDetail = JobBuilder.newJob(TenantAwareQuartzJob.class)
                    .withIdentity(jobKey)
                    .usingJobData(jobDataMap)
                    .storeDurably()
                    .build();

            TimeZone timeZone = resolveTimeZone(strategy);
            CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(strategy.getCronExpression())
                    .inTimeZone(timeZone);
            CronTrigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerKey)
                    .withSchedule(scheduleBuilder)
                    .forJob(jobDetail)
                    .build();

            if (scheduler.checkExists(jobKey)) {
                scheduler.addJob(jobDetail, true);
                scheduler.rescheduleJob(triggerKey, trigger);
            } else {
                scheduler.scheduleJob(jobDetail, trigger);
            }
            log.info("Scheduled job {}", job.getId());
        } catch (SchedulerException ex) {
            throw new IllegalStateException("无法同步 Quartz 作业：" + ex.getMessage(), ex);
        }
    }

    private void unscheduleJob(SchedulerJob job) {
        try {
            TriggerKey triggerKey = triggerKey(job);
            JobKey jobKey = jobKey(job);
            if (scheduler.checkExists(triggerKey)) {
                scheduler.unscheduleJob(triggerKey);
            }
            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey);
            }
        } catch (SchedulerException ex) {
            throw new IllegalStateException("无法取消 Quartz 作业：" + ex.getMessage(), ex);
        }
    }

    private TimeZone resolveTimeZone(ScheduleStrategy strategy) {
        if (StringUtils.hasText(strategy.getTimeZone())) {
            return TimeZone.getTimeZone(strategy.getTimeZone());
        }
        return TimeZone.getDefault();
    }

    private JobKey jobKey(SchedulerJob job) {
        return JobKey.jobKey("scheduler-job-" + job.getId(), "default");
    }

    private TriggerKey triggerKey(SchedulerJob job) {
        return TriggerKey.triggerKey("scheduler-trigger-" + job.getId(), "default");
    }
}
