package com.assoc.product.service.impl;

import com.assoc.product.dto.ProductCategoryResponse;
import com.assoc.product.entity.ProductCategory;
import com.assoc.product.repository.ProductCategoryRepository;
import com.assoc.product.service.ProductCategoryService;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;

    @Override
    public List<ProductCategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductCategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatusOrderBySortOrderAsc(1).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductCategoryResponse> getCategoryTree() {
        List<ProductCategory> allCategories = categoryRepository.findByStatusOrderBySortOrderAsc(1);
        return buildTree(allCategories);
    }

    @Override
    public ProductCategoryResponse getById(Long id) {
        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("产品分类不存在: " + id));
        return toResponse(category);
    }

    private List<ProductCategoryResponse> buildTree(List<ProductCategory> categories) {
        Map<Long, List<ProductCategory>> childrenMap = categories.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(ProductCategory::getParentId));

        return categories.stream()
                .filter(c -> c.getParentId() == null)
                .map(c -> toResponseWithChildren(c, childrenMap))
                .collect(Collectors.toList());
    }

    private ProductCategoryResponse toResponseWithChildren(ProductCategory category,
                                                           Map<Long, List<ProductCategory>> childrenMap) {
        ProductCategoryResponse response = toResponse(category);
        List<ProductCategory> children = childrenMap.get(category.getId());
        if (children != null && !children.isEmpty()) {
            response.setChildren(children.stream()
                    .map(c -> toResponseWithChildren(c, childrenMap))
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private ProductCategoryResponse toResponse(ProductCategory category) {
        ProductCategoryResponse response = new ProductCategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setCode(category.getCode());
        response.setParentId(category.getParentId());
        response.setSortOrder(category.getSortOrder());
        response.setStatus(category.getStatus());
        response.setDescription(category.getDescription());
        return response;
    }
}
