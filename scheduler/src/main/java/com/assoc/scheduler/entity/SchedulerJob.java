package com.assoc.scheduler.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Job definition per tenant. Describes WHAT to run and which strategy to use (WHEN).
 */
@Data
@Entity
@Table(name = "sch_job")
@EqualsAndHashCode(callSuper = true)
public class SchedulerJob extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /** Human readable description for the job. */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Job execution type (HTTP / COMMAND / INTERNAL_SERVICE). */
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 50)
    private JobType jobType;

    /** JSON config interpreted by the selected JobType handler. */
    @Column(name = "job_config", nullable = false, columnDefinition = "TEXT")
    private String jobConfig;

    /** FK to ScheduleStrategy (when to run). */
    @Column(name = "schedule_strategy_id", nullable = false)
    private Long scheduleStrategyId;

    /** Placeholder JSON for future precondition evaluation. */
    @Column(name = "precondition_config", columnDefinition = "TEXT")
    private String preconditionConfig;

    /** Whether the job is active and synchronized with Quartz. */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = Boolean.TRUE;
}
