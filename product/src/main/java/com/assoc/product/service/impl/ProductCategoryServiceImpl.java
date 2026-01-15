package com.assoc.product.service.impl;

import com.assoc.product.dto.ProductCategoryRequest;
import com.assoc.product.dto.ProductCategoryResponse;
import com.assoc.product.entity.ProductCategory;
import com.assoc.product.repository.ProductCategoryRepository;
import com.assoc.product.repository.ProductRepository;
import com.assoc.product.service.ProductCategoryService;
import com.assoc.common.exception.BusinessException;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;

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

    @Override
    @Transactional
    public ProductCategoryResponse create(ProductCategoryRequest request) {
        String code = request.getCode();
        if (!StringUtils.hasText(code)) {
            code = "CAT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        if (categoryRepository.existsByCode(code)) {
            throw new BusinessException("分类代码已存在: " + code);
        }

        if (request.getParentId() != null) {
            categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("父分类不存在: " + request.getParentId()));
        }

        ProductCategory category = new ProductCategory();
        category.setName(request.getName());
        category.setCode(code);
        category.setParentId(request.getParentId());
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        category.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        category.setDescription(request.getDescription());

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    @Override
    @Transactional
    public ProductCategoryResponse update(Long id, ProductCategoryRequest request) {
        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("产品分类不存在: " + id));

        if (StringUtils.hasText(request.getCode()) && !request.getCode().equals(category.getCode())) {
            if (categoryRepository.existsByCodeAndIdNot(request.getCode(), id)) {
                throw new BusinessException("分类代码已存在: " + request.getCode());
            }
            category.setCode(request.getCode());
        }

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BusinessException("父分类不能设为自己");
            }
            if (isDescendant(id, request.getParentId())) {
                throw new BusinessException("不能将父分类设为自己的子分类");
            }
            categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("父分类不存在: " + request.getParentId()));
        }

        category.setName(request.getName());
        category.setParentId(request.getParentId());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }
        category.setDescription(request.getDescription());

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("产品分类不存在: " + id));

        List<ProductCategory> children = categoryRepository.findByParentId(id);
        if (!children.isEmpty()) {
            throw new BusinessException("该分类下存在子分类，请先删除子分类");
        }

        long productCount = productRepository.countByCategory_Id(id);
        if (productCount > 0) {
            throw new BusinessException("该分类下存在 " + productCount + " 个产品，请先移除相关产品");
        }

        categoryRepository.delete(category);
    }

    private boolean isDescendant(Long ancestorId, Long descendantId) {
        Set<Long> visited = new HashSet<>();
        Long currentId = descendantId;
        while (currentId != null) {
            if (visited.contains(currentId)) {
                break;
            }
            if (currentId.equals(ancestorId)) {
                return true;
            }
            visited.add(currentId);
            ProductCategory current = categoryRepository.findById(currentId).orElse(null);
            currentId = current != null ? current.getParentId() : null;
        }
        return false;
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
