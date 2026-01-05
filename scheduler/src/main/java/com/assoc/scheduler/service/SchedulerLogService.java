package com.assoc.scheduler.service;

import com.assoc.common.context.RequestContext;
import com.assoc.scheduler.entity.ExecutionStatus;
import com.assoc.scheduler.entity.JobExecutionLog;
import com.assoc.scheduler.repository.JobExecutionLogRepository;
import com.assoc.scheduler.repository.SchedulerJobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulerLogService {

    private final JobExecutionLogRepository logRepository;
    private final SchedulerJobRepository jobRepository;
    private final RequestContext requestContext;

    @Transactional
    public List<JobExecutionLog> listLogs(Long jobId, ExecutionStatus status,
                                          java.time.LocalDateTime startTime,
                                          java.time.LocalDateTime endTime) {
        List<JobExecutionLog> logs;
        if (jobId != null) {
            jobRepository.findById(jobId)
                    .orElseThrow(() -> new IllegalArgumentException("作业不存在"));
            if (status != null) {
                logs = logRepository.findByJobIdAndStatusOrderByScheduledFireTimeDesc(jobId, status);
            } else {
                logs = logRepository.findByJobIdOrderByScheduledFireTimeDesc(jobId);
            }
        } else if (status != null) {
            logs = logRepository.findAllByStatusOrderByScheduledFireTimeDesc(status);
        } else {
            logs = logRepository.findAllByOrderByScheduledFireTimeDesc();
        }
        return logs.stream()
                .filter(log -> startTime == null || !log.getScheduledFireTime().isBefore(startTime))
                .filter(log -> endTime == null || !log.getScheduledFireTime().isAfter(endTime))
                .toList();
    }
}
