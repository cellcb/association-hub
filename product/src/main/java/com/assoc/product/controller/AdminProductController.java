package com.assoc.product.controller;

import com.assoc.product.dto.ProductListResponse;
import com.assoc.product.dto.ProductRequest;
import com.assoc.product.dto.ProductResponse;
import com.assoc.product.service.ProductService;
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

@Tag(name = "产品管理", description = "产品管理后台接口")
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @Operation(summary = "获取产品列表")
    @GetMapping
    public Result<Page<ProductListResponse>> getProducts(
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "分类ID") @RequestParam(required = false) Long categoryId,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return Result.success(productService.getAllProducts(status, categoryId, pageable));
    }

    @Operation(summary = "获取产品详情")
    @GetMapping("/{id}")
    public Result<ProductResponse> getProductById(@PathVariable Long id) {
        return Result.success(productService.getProductById(id));
    }

    @Operation(summary = "创建产品")
    @PostMapping
    public Result<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return Result.success(productService.createProduct(request));
    }

    @Operation(summary = "更新产品")
    @PutMapping("/{id}")
    public Result<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return Result.success(productService.updateProduct(id, request));
    }

    @Operation(summary = "删除产品")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.success(null);
    }
}
