package com.assoc.cms.controller;

import com.assoc.cms.dto.ExpertListResponse;
import com.assoc.cms.dto.ExpertRequest;
import com.assoc.cms.dto.ExpertResponse;
import com.assoc.cms.service.ExpertService;
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

@Tag(name = "专家管理", description = "专家管理后台接口")
@RestController
@RequestMapping("/api/admin/experts")
@RequiredArgsConstructor
public class AdminExpertController {

    private final ExpertService expertService;

    @Operation(summary = "获取专家列表")
    @GetMapping
    public Result<Page<ExpertListResponse>> getExperts(
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(expertService.getAllExperts(status, pageable));
    }

    @Operation(summary = "获取专家详情")
    @GetMapping("/{id}")
    public Result<ExpertResponse> getExpertById(@PathVariable Long id) {
        return Result.success(expertService.getExpertById(id));
    }

    @Operation(summary = "创建专家")
    @PostMapping
    public Result<ExpertResponse> createExpert(@Valid @RequestBody ExpertRequest request) {
        return Result.success(expertService.createExpert(request));
    }

    @Operation(summary = "更新专家")
    @PutMapping("/{id}")
    public Result<ExpertResponse> updateExpert(@PathVariable Long id, @Valid @RequestBody ExpertRequest request) {
        return Result.success(expertService.updateExpert(id, request));
    }

    @Operation(summary = "删除专家")
    @DeleteMapping("/{id}")
    public Result<Void> deleteExpert(@PathVariable Long id) {
        expertService.deleteExpert(id);
        return Result.success(null);
    }
}
