package com.assoc.cms.service.impl;

import com.assoc.cms.dto.ManufacturerCategoryResponse;
import com.assoc.cms.entity.ManufacturerCategory;
import com.assoc.cms.repository.ManufacturerCategoryRepository;
import com.assoc.cms.service.ManufacturerCategoryService;
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
public class ManufacturerCategoryServiceImpl implements ManufacturerCategoryService {

    private final ManufacturerCategoryRepository categoryRepository;

    private static final int STATUS_ACTIVE = 1;

    @Override
    public List<ManufacturerCategoryResponse> getAllCategories() {
        return categoryRepository.findAllByStatusOrderBySortOrderAsc(STATUS_ACTIVE)
                .stream()
                .map(ManufacturerCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<ManufacturerCategoryResponse> getCategoryTree() {
        List<ManufacturerCategory> allCategories = categoryRepository.findAllByStatusOrderBySortOrderAsc(STATUS_ACTIVE);

        Map<Long, List<ManufacturerCategory>> childrenMap = allCategories.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(ManufacturerCategory::getParentId));

        List<ManufacturerCategoryResponse> roots = new ArrayList<>();
        for (ManufacturerCategory category : allCategories) {
            if (category.getParentId() == null) {
                ManufacturerCategoryResponse dto = ManufacturerCategoryResponse.from(category);
                dto.setChildren(buildChildren(category.getId(), childrenMap));
                roots.add(dto);
            }
        }
        return roots;
    }

    private List<ManufacturerCategoryResponse> buildChildren(Long parentId, Map<Long, List<ManufacturerCategory>> childrenMap) {
        List<ManufacturerCategory> children = childrenMap.get(parentId);
        if (children == null || children.isEmpty()) {
            return null;
        }
        return children.stream()
                .map(c -> {
                    ManufacturerCategoryResponse dto = ManufacturerCategoryResponse.from(c);
                    dto.setChildren(buildChildren(c.getId(), childrenMap));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
