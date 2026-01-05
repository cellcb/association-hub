package com.assoc.scheduler.handler;

import com.assoc.scheduler.entity.JobType;
import com.assoc.scheduler.entity.SchedulerJob;
import org.quartz.JobExecutionContext;

/**
 * Contract for executing a concrete job type.
 */
public interface JobHandler {

    JobType getType();

    void handle(SchedulerJob job, JobExecutionContext context) throws Exception;
}
