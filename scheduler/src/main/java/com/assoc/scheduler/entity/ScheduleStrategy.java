package com.assoc.scheduler.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Structured schedule definition (WHEN), reusable by multiple jobs of the same tenant.
 */
@Data
@Entity
@Table(name = "sch_schedule_strategy")
@EqualsAndHashCode(callSuper = true)
public class ScheduleStrategy extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /** Friendly description of the schedule. */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Type of schedule template (influences which fields apply). */
    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false, length = 50)
    private ScheduleType scheduleType;

    /** Cron expression actually used by Quartz (derived or manually provided). */
    @Column(name = "cron_expression", nullable = false, length = 255)
    private String cronExpression;

    /** Optional window start (used for DAILY/WEEKLY and metadata). */
    @Column(name = "start_time")
    private java.time.LocalDateTime startTime;

    /** Optional window end (metadata / future use). */
    @Column(name = "end_time")
    private java.time.LocalDateTime endTime;

    /** Time zone for cron schedule (defaults to system). */
    @Column(name = "time_zone", length = 64)
    private String timeZone;

    /** Interval in seconds (for FIXED_RATE). */
    @Column(name = "interval_seconds")
    private Integer intervalSeconds;

    /** Comma-separated day-of-week values (1-7) for WEEKLY schedules. */
    @Column(name = "days_of_week", length = 32)
    private String daysOfWeek;
}
