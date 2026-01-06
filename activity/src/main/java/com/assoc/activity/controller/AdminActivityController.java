package com.assoc.activity.controller;

import com.assoc.activity.dto.ActivityListResponse;
import com.assoc.activity.dto.ActivityRequest;
import com.assoc.activity.dto.ActivityResponse;
import com.assoc.activity.dto.RegistrationResponse;
import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import com.assoc.activity.entity.RegistrationStatus;
import com.assoc.activity.service.ActivityService;
import com.assoc.activity.service.RegistrationService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@Tag(name = "活动管理", description = "活动管理后台接口")
@RestController
@RequestMapping("/api/admin/activities")
@RequiredArgsConstructor
public class AdminActivityController {

    private final ActivityService activityService;
    private final RegistrationService registrationService;

    @Operation(summary = "获取活动列表")
    @GetMapping
    public Result<Page<ActivityListResponse>> getActivities(
            @Parameter(description = "状态") @RequestParam(required = false) ActivityStatus status,
            @Parameter(description = "类型") @RequestParam(required = false) ActivityType type,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(activityService.getAllActivities(status, type, pageable));
    }

    @Operation(summary = "获取活动详情")
    @GetMapping("/{id}")
    public Result<ActivityResponse> getActivityById(@PathVariable Long id) {
        return Result.success(activityService.getActivityById(id));
    }

    @Operation(summary = "创建活动")
    @PostMapping
    public Result<ActivityResponse> createActivity(@Valid @RequestBody ActivityRequest request) {
        return Result.success(activityService.createActivity(request));
    }

    @Operation(summary = "更新活动")
    @PutMapping("/{id}")
    public Result<ActivityResponse> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request) {
        return Result.success(activityService.updateActivity(id, request));
    }

    @Operation(summary = "删除活动")
    @DeleteMapping("/{id}")
    public Result<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return Result.success(null);
    }

    @Operation(summary = "更新活动状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam ActivityStatus status) {
        activityService.updateStatus(id, status);
        return Result.success(null);
    }

    @Operation(summary = "获取活动报名列表")
    @GetMapping("/{id}/registrations")
    public Result<Page<RegistrationResponse>> getRegistrations(
            @PathVariable Long id,
            @Parameter(description = "状态") @RequestParam(required = false) RegistrationStatus status,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(registrationService.getRegistrations(id, status, pageable));
    }

    @Operation(summary = "更新报名状态")
    @PutMapping("/registrations/{regId}/status")
    public Result<Void> updateRegistrationStatus(
            @PathVariable Long regId,
            @RequestParam RegistrationStatus status) {
        registrationService.updateStatus(regId, status);
        return Result.success(null);
    }

    @Operation(summary = "取消报名")
    @DeleteMapping("/registrations/{regId}")
    public Result<Void> cancelRegistration(@PathVariable Long regId) {
        registrationService.cancelRegistration(regId);
        return Result.success(null);
    }
}
