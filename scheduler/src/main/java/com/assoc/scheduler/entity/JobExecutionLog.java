package com.assoc.scheduler.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Execution log entry per firing (stores status, duration, retry count, error, etc.).
 */
@Data
@Entity
@Table(name = "sch_job_execution_log")
@EqualsAndHashCode(callSuper = true)
public class JobExecutionLog extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    /** Strategy that triggered this execution. */
    @Column(name = "strategy_id", nullable = false)
    private Long strategyId;

    /** Scheduled fire time reported by Quartz. */
    @Column(name = "scheduled_fire_time", nullable = false)
    private LocalDateTime scheduledFireTime;

    /** Actual fire time when job began executing. */
    @Column(name = "actual_fire_time", nullable = false)
    private LocalDateTime actualFireTime;

    /** Completion time. */
    @Column(name = "finished_time")
    private LocalDateTime finishedTime;

    /** Execution status (SUCCESS, FAILED, SKIPPED, RETRIED). */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ExecutionStatus status;

    /** Error details when failed. */
    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    /** Number of retry attempts that preceded this execution. */
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    /** Duration in milliseconds (difference between start and finish). */
    @Column(name = "duration_ms")
    private Integer durationMs;
}
