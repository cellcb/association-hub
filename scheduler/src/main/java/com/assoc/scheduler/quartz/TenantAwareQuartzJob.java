package com.assoc.scheduler.quartz;

import com.assoc.common.context.RequestContext;
import com.assoc.scheduler.service.SchedulerExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

/**
 * Quartz job entry point that delegates to the scheduler execution service.
 */
@Slf4j
@Component
@DisallowConcurrentExecution
@RequiredArgsConstructor
public class TenantAwareQuartzJob extends QuartzJobBean {

    public static final String JOB_ID_KEY = "jobId";
    public static final String STRATEGY_ID_KEY = "scheduleStrategyId";
    public static final String RETRY_COUNT_KEY = "retryCount";
    public static final String JOB_TYPE_KEY = "jobType";

    private final RequestContext requestContext;
    private final SchedulerExecutionService executionService;

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        log.debug("QuartzJob triggered");
        JobDataMap dataMap = context.getMergedJobDataMap();
        Long jobId = dataMap.getLong(JOB_ID_KEY);
        Long strategyId = dataMap.containsKey(STRATEGY_ID_KEY) ? dataMap.getLong(STRATEGY_ID_KEY) : null;
        int retryCount = dataMap.containsKey(RETRY_COUNT_KEY) ? dataMap.getInt(RETRY_COUNT_KEY) : 0;

        if (jobId == null) {
            throw new JobExecutionException("Missing jobId in JobDataMap");
        }

        try {
            executionService.execute(jobId, strategyId, retryCount, context);
        } catch (Exception ex) {
            log.error("Scheduler job execution failed, jobId={}", jobId, ex);
            throw new JobExecutionException(ex);
        } finally {
            log.debug("Clearing context after job {}", jobId);
            requestContext.clear();
        }
    }
}
