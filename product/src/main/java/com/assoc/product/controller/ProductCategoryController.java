package com.assoc.product.controller;

import com.assoc.product.dto.ProductCategoryResponse;
import com.assoc.product.service.ProductCategoryService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "产品分类", description = "产品分类公开接口")
@RestController
@RequestMapping("/api/products/categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    @Operation(summary = "获取分类列表")
    @GetMapping
    public Result<List<ProductCategoryResponse>> getCategories() {
        return Result.success(categoryService.getActiveCategories());
    }

    @Operation(summary = "获取分类树")
    @GetMapping("/tree")
    public Result<List<ProductCategoryResponse>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }
}
