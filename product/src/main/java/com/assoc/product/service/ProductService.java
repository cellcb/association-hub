package com.assoc.product.service;

import com.assoc.common.event.VectorSyncable;
import com.assoc.product.dto.ProductListResponse;
import com.assoc.product.dto.ProductRequest;
import com.assoc.product.dto.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService extends VectorSyncable {

    Page<ProductListResponse> getPublishedProducts(Pageable pageable);

    Page<ProductListResponse> getProductsByCategory(Long categoryId, Pageable pageable);

    Page<ProductListResponse> searchProducts(String keyword, Pageable pageable);

    ProductResponse getProductById(Long id);

    void incrementViews(Long id);

    // Admin methods
    Page<ProductListResponse> getAllProducts(Integer status, Long categoryId, Pageable pageable);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}
