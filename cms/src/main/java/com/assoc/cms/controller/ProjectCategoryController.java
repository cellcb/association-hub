package com.assoc.cms.controller;

import com.assoc.cms.dto.ProjectCategoryResponse;
import com.assoc.cms.service.ProjectCategoryService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "项目类别", description = "项目类别公开接口")
@RestController
@RequestMapping("/api/project-categories")
@RequiredArgsConstructor
public class ProjectCategoryController {

    private final ProjectCategoryService categoryService;

    @Operation(summary = "获取所有启用的项目类别")
    @GetMapping
    public Result<List<ProjectCategoryResponse>> getActiveCategories() {
        return Result.success(categoryService.getActiveCategories());
    }
}
