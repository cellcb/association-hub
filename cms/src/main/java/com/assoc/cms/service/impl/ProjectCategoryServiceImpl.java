package com.assoc.cms.service.impl;

import com.assoc.cms.dto.ProjectCategoryRequest;
import com.assoc.cms.dto.ProjectCategoryResponse;
import com.assoc.cms.entity.ProjectCategoryEntity;
import com.assoc.cms.repository.ProjectCategoryRepository;
import com.assoc.cms.repository.ProjectRepository;
import com.assoc.cms.service.ProjectCategoryService;
import com.assoc.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectCategoryServiceImpl implements ProjectCategoryService {

    private final ProjectCategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;

    @Override
    public List<ProjectCategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectCategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatusOrderBySortOrderAsc(1)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectCategoryResponse getById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("类别不存在"));
    }

    @Override
    @Transactional
    public ProjectCategoryResponse create(ProjectCategoryRequest request) {
        // Generate code if not provided
        String code = request.getCode();
        if (code == null || code.isBlank()) {
            code = "pc_" + UUID.randomUUID().toString().substring(0, 8);
        }

        // Check code uniqueness
        if (categoryRepository.existsByCode(code)) {
            throw new BusinessException("类别代码已存在");
        }

        ProjectCategoryEntity entity = new ProjectCategoryEntity();
        entity.setName(request.getName());
        entity.setCode(code);
        entity.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        entity.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        entity.setDescription(request.getDescription());

        return toResponse(categoryRepository.save(entity));
    }

    @Override
    @Transactional
    public ProjectCategoryResponse update(Long id, ProjectCategoryRequest request) {
        ProjectCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("类别不存在"));

        // Check code uniqueness (excluding current entity)
        String code = request.getCode();
        if (code != null && !code.isBlank() && categoryRepository.existsByCodeAndIdNot(code, id)) {
            throw new BusinessException("类别代码已存在");
        }

        entity.setName(request.getName());
        if (code != null && !code.isBlank()) {
            entity.setCode(code);
        }
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        entity.setDescription(request.getDescription());

        return toResponse(categoryRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ProjectCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("类别不存在"));

        // Check if any projects use this category
        long projectCount = projectRepository.countByCategoryId(id);
        if (projectCount > 0) {
            throw new BusinessException("该类别下有 " + projectCount + " 个项目，无法删除");
        }

        categoryRepository.delete(entity);
    }

    private ProjectCategoryResponse toResponse(ProjectCategoryEntity entity) {
        ProjectCategoryResponse response = new ProjectCategoryResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setCode(entity.getCode());
        response.setSortOrder(entity.getSortOrder());
        response.setStatus(entity.getStatus());
        response.setDescription(entity.getDescription());
        return response;
    }
}
