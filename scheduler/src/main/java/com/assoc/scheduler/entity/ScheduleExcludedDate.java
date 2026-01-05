package com.assoc.scheduler.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * Stores dates (per strategy) where execution should be skipped, e.g. holidays.
 */
@Data
@Entity
@Table(name = "sch_schedule_excluded_date")
@EqualsAndHashCode(callSuper = true)
public class ScheduleExcludedDate extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "strategy_id", nullable = false)
    private Long strategyId;

    /** Date to skip (yyyy-MM-dd). */
    @Column(name = "excluded_date", nullable = false)
    private LocalDate excludedDate;

    /** Optional reason for skipping (e.g. holiday). */
    @Column(name = "reason", length = 255)
    private String reason;
}
