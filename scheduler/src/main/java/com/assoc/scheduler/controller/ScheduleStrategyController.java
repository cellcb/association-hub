package com.assoc.scheduler.controller;

import com.assoc.common.Result;
import com.assoc.scheduler.controller.dto.ScheduleStrategyRequest;
import com.assoc.scheduler.entity.ScheduleStrategy;
import com.assoc.scheduler.service.ScheduleStrategyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scheduler/strategies")
@Tag(name = "作业调度策略")
@RequiredArgsConstructor
public class ScheduleStrategyController {

    private final ScheduleStrategyService strategyService;

    @GetMapping
    @Operation(summary = "列出当前租户的策略")
    public Result<List<ScheduleStrategy>> listStrategies() {
        return Result.success(strategyService.listStrategies());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取策略详情")
    public Result<ScheduleStrategy> getStrategy(@PathVariable Long id) {
        return Result.success(strategyService.getStrategy(id));
    }

    @PostMapping
    @Operation(summary = "创建策略")
    public Result<ScheduleStrategy> createStrategy(@Valid @RequestBody ScheduleStrategyRequest request) {
        ScheduleStrategy strategy = toEntity(request);
        return Result.success(strategyService.createStrategy(strategy, request.getExcludedDates()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新策略")
    public Result<ScheduleStrategy> updateStrategy(@PathVariable Long id,
                                                   @Valid @RequestBody ScheduleStrategyRequest request) {
        ScheduleStrategy strategy = toEntity(request);
        strategy.setId(id);
        return Result.success(strategyService.updateStrategy(id, strategy, request.getExcludedDates()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除策略")
    public Result<Boolean> deleteStrategy(@PathVariable Long id) {
        strategyService.deleteStrategy(id);
        return Result.success(Boolean.TRUE);
    }

    @GetMapping("/{id}/excluded-dates")
    @Operation(summary = "获取排除日期")
    public Result<?> listExcludedDates(@PathVariable Long id) {
        return Result.success(strategyService.listExcludedDates(id));
    }

    @PutMapping("/{id}/excluded-dates")
    @Operation(summary = "更新排除日期")
    public Result<Boolean> updateExcludedDates(@PathVariable Long id, @RequestBody List<java.time.LocalDate> dates) {
        strategyService.updateExcludedDates(id, dates);
        return Result.success(Boolean.TRUE);
    }

    private ScheduleStrategy toEntity(ScheduleStrategyRequest request) {
        ScheduleStrategy strategy = new ScheduleStrategy();
        strategy.setName(request.getName());
        strategy.setDescription(request.getDescription());
        strategy.setScheduleType(request.getScheduleType());
        strategy.setCronExpression(request.getCronExpression());
        strategy.setStartTime(request.getStartTime());
        strategy.setEndTime(request.getEndTime());
        strategy.setTimeZone(request.getTimeZone());
        strategy.setIntervalSeconds(request.getIntervalSeconds());
        strategy.setDaysOfWeek(request.getDaysOfWeek());
        return strategy;
    }
}
