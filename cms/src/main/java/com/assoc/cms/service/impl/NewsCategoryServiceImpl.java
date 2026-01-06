package com.assoc.cms.service.impl;

import com.assoc.cms.dto.NewsCategoryResponse;
import com.assoc.cms.entity.NewsCategory;
import com.assoc.cms.repository.NewsCategoryRepository;
import com.assoc.cms.service.NewsCategoryService;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsCategoryServiceImpl implements NewsCategoryService {

    private final NewsCategoryRepository newsCategoryRepository;

    @Override
    public List<NewsCategoryResponse> getAllCategories() {
        return newsCategoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NewsCategoryResponse> getActiveCategories() {
        return newsCategoryRepository.findByStatusOrderBySortOrderAsc(1).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NewsCategoryResponse getById(Long id) {
        NewsCategory category = newsCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("新闻分类不存在: " + id));
        return toResponse(category);
    }

    private NewsCategoryResponse toResponse(NewsCategory category) {
        NewsCategoryResponse response = new NewsCategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setCode(category.getCode());
        response.setSortOrder(category.getSortOrder());
        response.setStatus(category.getStatus());
        return response;
    }
}
