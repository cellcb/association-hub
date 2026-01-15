package com.assoc.cms.service;

import com.assoc.cms.dto.ProjectCategoryRequest;
import com.assoc.cms.dto.ProjectCategoryResponse;

import java.util.List;

public interface ProjectCategoryService {

    /**
     * Get all categories
     */
    List<ProjectCategoryResponse> getAllCategories();

    /**
     * Get all active categories
     */
    List<ProjectCategoryResponse> getActiveCategories();

    /**
     * Get category by ID
     */
    ProjectCategoryResponse getById(Long id);

    /**
     * Create a new category
     */
    ProjectCategoryResponse create(ProjectCategoryRequest request);

    /**
     * Update an existing category
     */
    ProjectCategoryResponse update(Long id, ProjectCategoryRequest request);

    /**
     * Delete a category
     */
    void delete(Long id);
}
