package com.assoc.product.controller;

import com.assoc.product.dto.ProductListResponse;
import com.assoc.product.dto.ProductResponse;
import com.assoc.product.service.ProductService;
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

@Tag(name = "产品", description = "产品公开接口")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "获取产品列表")
    @GetMapping
    public Result<Page<ProductListResponse>> getProducts(
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "分类ID") @RequestParam(required = false) Long categoryId,
            @PageableDefault(sort = "createdTime", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ProductListResponse> result;
        if (keyword != null && !keyword.isEmpty()) {
            result = productService.searchProducts(keyword, pageable);
        } else if (categoryId != null) {
            result = productService.getProductsByCategory(categoryId, pageable);
        } else {
            result = productService.getPublishedProducts(pageable);
        }
        return Result.success(result);
    }

    @Operation(summary = "获取产品详情")
    @GetMapping("/{id}")
    public Result<ProductResponse> getProductById(@PathVariable Long id) {
        return Result.success(productService.getProductById(id));
    }

    @Operation(summary = "增加浏览量")
    @PostMapping("/{id}/view")
    public Result<Void> incrementViews(@PathVariable Long id) {
        productService.incrementViews(id);
        return Result.success(null);
    }
}
