package com.assoc.cms.controller;

import com.assoc.cms.dto.ManufacturerCategoryResponse;
import com.assoc.cms.dto.ManufacturerListResponse;
import com.assoc.cms.dto.ManufacturerResponse;
import com.assoc.cms.service.ManufacturerCategoryService;
import com.assoc.cms.service.ManufacturerService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
@RequiredArgsConstructor
@Tag(name = "厂商展示", description = "厂商公开接口")
public class ManufacturerController {

    private final ManufacturerService manufacturerService;
    private final ManufacturerCategoryService categoryService;

    @GetMapping
    @Operation(summary = "获取厂商列表")
    public Result<Page<ManufacturerListResponse>> getManufacturers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Page<ManufacturerListResponse> result;
        if (StringUtils.hasText(keyword)) {
            result = manufacturerService.searchManufacturers(keyword, categoryId, pageRequest);
        } else if (categoryId != null) {
            result = manufacturerService.getManufacturersByCategory(categoryId, pageRequest);
        } else {
            result = manufacturerService.getPublishedManufacturers(pageRequest);
        }

        return Result.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取厂商详情")
    public Result<ManufacturerResponse> getManufacturer(@PathVariable Long id) {
        return Result.success(manufacturerService.getManufacturerById(id));
    }

    @PostMapping("/{id}/views")
    @Operation(summary = "增加浏览量")
    public Result<Void> incrementViews(@PathVariable Long id) {
        manufacturerService.incrementViews(id);
        return Result.success(null);
    }

    @GetMapping("/categories")
    @Operation(summary = "获取厂商分类列表")
    public Result<List<ManufacturerCategoryResponse>> getCategories() {
        return Result.success(categoryService.getAllCategories());
    }

    @GetMapping("/categories/tree")
    @Operation(summary = "获取厂商分类树")
    public Result<List<ManufacturerCategoryResponse>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }
}
