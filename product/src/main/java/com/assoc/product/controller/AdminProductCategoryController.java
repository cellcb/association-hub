package com.assoc.product.controller;

import com.assoc.product.dto.ProductCategoryRequest;
import com.assoc.product.dto.ProductCategoryResponse;
import com.assoc.product.service.ProductCategoryService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品分类管理", description = "产品分类管理后台接口")
@RestController
@RequestMapping("/api/admin/product-categories")
@RequiredArgsConstructor
public class AdminProductCategoryController {

    private final ProductCategoryService categoryService;

    @Operation(summary = "获取分类列表")
    @GetMapping
    public Result<List<ProductCategoryResponse>> getCategories() {
        return Result.success(categoryService.getAllCategories());
    }

    @Operation(summary = "获取分类树")
    @GetMapping("/tree")
    public Result<List<ProductCategoryResponse>> getCategoryTree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @Operation(summary = "获取分类详情")
    @GetMapping("/{id}")
    public Result<ProductCategoryResponse> getCategoryById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @Operation(summary = "创建分类")
    @PostMapping
    public Result<ProductCategoryResponse> createCategory(@Valid @RequestBody ProductCategoryRequest request) {
        return Result.success(categoryService.create(request));
    }

    @Operation(summary = "更新分类")
    @PutMapping("/{id}")
    public Result<ProductCategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody ProductCategoryRequest request) {
        return Result.success(categoryService.update(id, request));
    }

    @Operation(summary = "删除分类")
    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success(null);
    }
}
