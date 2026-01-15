package com.assoc.cms.controller;

import com.assoc.cms.dto.ProjectListResponse;
import com.assoc.cms.dto.ProjectResponse;
import com.assoc.cms.entity.ProjectCategory;
import com.assoc.cms.service.ProjectService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@Tag(name = "项目", description = "项目公开接口")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "获取项目列表")
    @GetMapping
    public Result<Page<ProjectListResponse>> getProjects(
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "项目类别代码") @RequestParam(required = false) String category,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ProjectListResponse> result;
        if (keyword != null && !keyword.isEmpty()) {
            result = projectService.searchProjects(keyword, pageable);
        } else if (category != null && !category.isEmpty()) {
            result = projectService.getProjectsByCategoryCode(category, pageable);
        } else {
            result = projectService.getPublishedProjects(pageable);
        }
        return Result.success(result);
    }

    @Operation(summary = "获取项目详情")
    @GetMapping("/{id}")
    public Result<ProjectResponse> getProjectById(@PathVariable Long id) {
        return Result.success(projectService.getProjectById(id));
    }

    @Operation(summary = "增加浏览量")
    @PostMapping("/{id}/view")
    public Result<Void> incrementViews(@PathVariable Long id) {
        projectService.incrementViews(id);
        return Result.success(null);
    }
}
