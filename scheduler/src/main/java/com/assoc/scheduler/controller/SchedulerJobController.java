package com.assoc.scheduler.controller;

import com.assoc.common.Result;
import com.assoc.scheduler.controller.dto.SchedulerJobRequest;
import com.assoc.scheduler.entity.SchedulerJob;
import com.assoc.scheduler.service.SchedulerJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scheduler/jobs")
@Tag(name = "作业调度管理")
@RequiredArgsConstructor
public class SchedulerJobController {

    private final SchedulerJobService jobService;

    @GetMapping
    @Operation(summary = "列出所有作业")
    public Result<List<SchedulerJob>> listJobs() {
        return Result.success(jobService.listJobs());
    }

    @GetMapping("/{id}")
    @Operation(summary = "作业详情")
    public Result<SchedulerJob> getJob(@PathVariable Long id) {
        return Result.success(jobService.getJob(id));
    }

    @PostMapping
    @Operation(summary = "创建作业")
    public Result<SchedulerJob> createJob(@Valid @RequestBody SchedulerJobRequest request) {
        SchedulerJob job = toEntity(request);
        return Result.success(jobService.createJob(job));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新作业")
    public Result<SchedulerJob> updateJob(@PathVariable Long id,
                                          @Valid @RequestBody SchedulerJobRequest request) {
        SchedulerJob job = toEntity(request);
        job.setId(id);
        return Result.success(jobService.updateJob(id, job));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除作业")
    public Result<Boolean> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return Result.success(Boolean.TRUE);
    }

    @PostMapping("/{id}/enable")
    @Operation(summary = "启用作业")
    public Result<Boolean> enableJob(@PathVariable Long id) {
        jobService.enableJob(id);
        return Result.success(Boolean.TRUE);
    }

    @PostMapping("/{id}/disable")
    @Operation(summary = "禁用作业")
    public Result<Boolean> disableJob(@PathVariable Long id) {
        jobService.disableJob(id);
        return Result.success(Boolean.TRUE);
    }

    private SchedulerJob toEntity(SchedulerJobRequest request) {
        SchedulerJob job = new SchedulerJob();
        job.setName(request.getName());
        job.setDescription(request.getDescription());
        job.setJobType(request.getJobType());
        job.setJobConfig(request.getJobConfig());
        job.setScheduleStrategyId(request.getScheduleStrategyId());
        job.setPreconditionConfig(request.getPreconditionConfig());
        job.setEnabled(request.getEnabled());
        return job;
    }
}
