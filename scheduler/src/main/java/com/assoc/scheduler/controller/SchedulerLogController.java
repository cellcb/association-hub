package com.assoc.scheduler.controller;

import com.assoc.common.Result;
import com.assoc.scheduler.entity.ExecutionStatus;
import com.assoc.scheduler.entity.JobExecutionLog;
import com.assoc.scheduler.service.SchedulerLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/scheduler/logs")
@Tag(name = "作业调度日志")
@RequiredArgsConstructor
public class SchedulerLogController {

    private final SchedulerLogService logService;

    @GetMapping
    @Operation(summary = "查询作业执行日志")
    public Result<List<JobExecutionLog>> listLogs(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) ExecutionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return Result.success(logService.listLogs(jobId, status, startTime, endTime));
    }
}
