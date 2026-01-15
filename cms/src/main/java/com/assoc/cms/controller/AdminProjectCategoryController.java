package com.assoc.cms.controller;

import com.assoc.cms.dto.ProjectCategoryRequest;
import com.assoc.cms.dto.ProjectCategoryResponse;
import com.assoc.cms.service.ProjectCategoryService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "项目类别管理", description = "项目类别后台管理接口")
@RestController
@RequestMapping("/api/admin/project-categories")
@RequiredArgsConstructor
public class AdminProjectCategoryController {

    private final ProjectCategoryService categoryService;

    @Operation(summary = "获取所有项目类别")
    @GetMapping
    public Result<List<ProjectCategoryResponse>> getAll() {
        return Result.success(categoryService.getAllCategories());
    }

    @Operation(summary = "获取项目类别详情")
    @GetMapping("/{id}")
    public Result<ProjectCategoryResponse> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @Operation(summary = "创建项目类别")
    @PostMapping
    public Result<ProjectCategoryResponse> create(@Valid @RequestBody ProjectCategoryRequest request) {
        return Result.success(categoryService.create(request));
    }

    @Operation(summary = "更新项目类别")
    @PutMapping("/{id}")
    public Result<ProjectCategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProjectCategoryRequest request) {
        return Result.success(categoryService.update(id, request));
    }

    @Operation(summary = "删除项目类别")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}
