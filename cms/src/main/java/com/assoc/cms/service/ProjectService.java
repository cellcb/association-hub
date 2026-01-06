package com.assoc.cms.service;

import com.assoc.cms.dto.ProjectListResponse;
import com.assoc.cms.dto.ProjectRequest;
import com.assoc.cms.dto.ProjectResponse;
import com.assoc.cms.entity.ProjectCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {

    Page<ProjectListResponse> getPublishedProjects(Pageable pageable);

    Page<ProjectListResponse> getProjectsByCategory(ProjectCategory category, Pageable pageable);

    Page<ProjectListResponse> searchProjects(String keyword, Pageable pageable);

    ProjectResponse getProjectById(Long id);

    void incrementViews(Long id);

    // Admin methods
    Page<ProjectListResponse> getAllProjects(Integer status, ProjectCategory category, Pageable pageable);

    ProjectResponse createProject(ProjectRequest request);

    ProjectResponse updateProject(Long id, ProjectRequest request);

    void deleteProject(Long id);
}
