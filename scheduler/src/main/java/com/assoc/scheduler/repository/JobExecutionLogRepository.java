package com.assoc.scheduler.repository;

import com.assoc.scheduler.entity.ExecutionStatus;
import com.assoc.scheduler.entity.JobExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobExecutionLogRepository extends JpaRepository<JobExecutionLog, Long> {

    List<JobExecutionLog> findByJobIdOrderByScheduledFireTimeDesc(Long jobId);

    List<JobExecutionLog> findByJobIdAndStatusOrderByScheduledFireTimeDesc(Long jobId, ExecutionStatus status);

    List<JobExecutionLog> findAllByOrderByScheduledFireTimeDesc();

    List<JobExecutionLog> findAllByStatusOrderByScheduledFireTimeDesc(ExecutionStatus status);
}
