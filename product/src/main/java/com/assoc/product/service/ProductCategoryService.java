package com.assoc.product.service;

import com.assoc.product.dto.ProductCategoryResponse;

import java.util.List;

public interface ProductCategoryService {

    List<ProductCategoryResponse> getAllCategories();

    List<ProductCategoryResponse> getActiveCategories();

    List<ProductCategoryResponse> getCategoryTree();

    ProductCategoryResponse getById(Long id);
}
