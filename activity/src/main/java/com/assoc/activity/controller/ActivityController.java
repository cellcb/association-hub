package com.assoc.activity.controller;

import com.assoc.activity.dto.ActivityListResponse;
import com.assoc.activity.dto.ActivityResponse;
import com.assoc.activity.dto.RegistrationRequest;
import com.assoc.activity.dto.RegistrationResponse;
import com.assoc.activity.entity.ActivityType;
import com.assoc.activity.service.ActivityService;
import com.assoc.activity.service.RegistrationService;
import com.assoc.common.Result;
import com.assoc.common.context.RequestContext;
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

@Tag(name = "活动", description = "活动公开接口")
@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final RegistrationService registrationService;
    private final RequestContext requestContext;

    @Operation(summary = "获取活动列表")
    @GetMapping
    public Result<Page<ActivityListResponse>> getActivities(
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "活动类型") @RequestParam(required = false) ActivityType type,
            @PageableDefault(sort = "date", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<ActivityListResponse> result;
        if (keyword != null && !keyword.isEmpty()) {
            result = activityService.searchActivities(keyword, pageable);
        } else if (type != null) {
            result = activityService.getActivitiesByType(type, pageable);
        } else {
            result = activityService.getActiveActivities(pageable);
        }
        return Result.success(result);
    }

    @Operation(summary = "获取活动详情")
    @GetMapping("/{id}")
    public Result<ActivityResponse> getActivityById(@PathVariable Long id) {
        return Result.success(activityService.getActivityById(id));
    }

    @Operation(summary = "报名活动")
    @PostMapping("/{id}/register")
    public Result<RegistrationResponse> register(
            @PathVariable Long id,
            @Valid @RequestBody RegistrationRequest request) {
        Long userId = requestContext.currentUserId().orElse(null);
        return Result.success(registrationService.register(id, request, userId));
    }

    @Operation(summary = "查询报名状态")
    @GetMapping("/{id}/registration")
    public Result<RegistrationResponse> getRegistration(
            @PathVariable Long id,
            @Parameter(description = "手机号") @RequestParam String phone) {
        return Result.success(registrationService.getRegistrationByActivityAndPhone(id, phone));
    }

    @Operation(summary = "检查是否已报名")
    @GetMapping("/{id}/check-registration")
    public Result<Boolean> checkRegistration(
            @PathVariable Long id,
            @Parameter(description = "手机号") @RequestParam String phone) {
        return Result.success(registrationService.isRegistered(id, phone));
    }
}
