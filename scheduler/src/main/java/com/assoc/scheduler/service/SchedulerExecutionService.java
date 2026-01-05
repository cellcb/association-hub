package com.assoc.scheduler.service;

import org.quartz.JobExecutionContext;

/**
 * Executes a scheduler job, encapsulating the end-to-end workflow including handlers,
 * excluded date checks, retry logic, and logging.
 */
public interface SchedulerExecutionService {

    void execute(Long jobId,
                 Long strategyId,
                 int retryCount,
                 JobExecutionContext context) throws Exception;
}
