package com.assoc.scheduler.controller.dto;

import com.assoc.scheduler.entity.ScheduleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScheduleStrategyRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private ScheduleType scheduleType;

    /**
     * Cron expression only required when scheduleType == CRON.
     */
    private String cronExpression;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String timeZone;

    private Integer intervalSeconds;

    /**
     * Comma-separated day numbers (1-7) for WEEKLY schedules.
     */
    private String daysOfWeek;

    private List<LocalDate> excludedDates;
}
