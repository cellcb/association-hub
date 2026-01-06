package com.assoc.cms.controller;

import com.assoc.cms.dto.ProjectListResponse;
import com.assoc.cms.dto.ProjectRequest;
import com.assoc.cms.dto.ProjectResponse;
import com.assoc.cms.entity.ProjectCategory;
import com.assoc.cms.service.ProjectService;
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

@Tag(name = "项目管理", description = "项目管理后台接口")
@RestController
@RequestMapping("/api/admin/projects")
@RequiredArgsConstructor
public class AdminProjectController {

    private final ProjectService projectService;

    @Operation(summary = "获取项目列表")
    @GetMapping
    public Result<Page<ProjectListResponse>> getProjects(
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "项目类别") @RequestParam(required = false) ProjectCategory category,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(projectService.getAllProjects(status, category, pageable));
    }

    @Operation(summary = "获取项目详情")
    @GetMapping("/{id}")
    public Result<ProjectResponse> getProjectById(@PathVariable Long id) {
        return Result.success(projectService.getProjectById(id));
    }

    @Operation(summary = "创建项目")
    @PostMapping
    public Result<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        return Result.success(projectService.createProject(request));
    }

    @Operation(summary = "更新项目")
    @PutMapping("/{id}")
    public Result<ProjectResponse> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return Result.success(projectService.updateProject(id, request));
    }

    @Operation(summary = "删除项目")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return Result.success(null);
    }
}
