package com.assoc.cms.controller;

import com.assoc.cms.dto.NewsCategoryResponse;
import com.assoc.cms.service.NewsCategoryService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "新闻分类", description = "新闻分类公开接口")
@RestController
@RequestMapping("/api/news/categories")
@RequiredArgsConstructor
public class NewsCategoryController {

    private final NewsCategoryService newsCategoryService;

    @Operation(summary = "获取所有有效分类")
    @GetMapping
    public Result<List<NewsCategoryResponse>> getCategories() {
        return Result.success(newsCategoryService.getActiveCategories());
    }
}
