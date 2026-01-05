package com.assoc.scheduler.controller.dto;

import com.assoc.scheduler.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SchedulerJobRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private JobType jobType;

    @NotBlank
    private String jobConfig;

    @NotNull
    private Long scheduleStrategyId;

    private String preconditionConfig;

    private Boolean enabled = Boolean.TRUE;
}
