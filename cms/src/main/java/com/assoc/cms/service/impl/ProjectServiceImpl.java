package com.assoc.cms.service.impl;

import com.assoc.cms.dto.ProjectListResponse;
import com.assoc.cms.dto.ProjectRequest;
import com.assoc.cms.dto.ProjectResponse;
import com.assoc.cms.entity.Project;
import com.assoc.cms.entity.ProjectCategory;
import com.assoc.cms.entity.ProjectCategoryEntity;
import com.assoc.cms.repository.ProjectCategoryRepository;
import com.assoc.cms.repository.ProjectRepository;
import com.assoc.cms.service.ProjectService;
import com.assoc.common.event.VectorizeEvent;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectCategoryRepository projectCategoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final int STATUS_PUBLISHED = 1;
    private static final int STATUS_DRAFT = 0;

    @Override
    public Page<ProjectListResponse> getPublishedProjects(Pageable pageable) {
        return projectRepository.findByStatus(STATUS_PUBLISHED, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ProjectListResponse> getProjectsByCategory(ProjectCategory category, Pageable pageable) {
        return projectRepository.findByStatusAndCategory(STATUS_PUBLISHED, category, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ProjectListResponse> searchProjects(String keyword, Pageable pageable) {
        return projectRepository.searchByKeyword(keyword, STATUS_PUBLISHED, pageable)
                .map(this::toListResponse);
    }

    @Override
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在: " + id));
        return toResponse(project);
    }

    @Override
    @Transactional
    public void incrementViews(Long id) {
        projectRepository.incrementViews(id);
    }

    @Override
    public Page<ProjectListResponse> getAllProjects(Integer status, ProjectCategory category, Pageable pageable) {
        if (status != null && category != null) {
            return projectRepository.findByStatusAndCategory(status, category, pageable)
                    .map(this::toListResponse);
        } else if (status != null) {
            return projectRepository.findByStatus(status, pageable)
                    .map(this::toListResponse);
        } else if (category != null) {
            return projectRepository.findByCategory(category, pageable)
                    .map(this::toListResponse);
        }
        return projectRepository.findAll(pageable).map(this::toListResponse);
    }

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();
        mapRequestToEntity(request, project);
        project.setStatus(request.getStatus() != null ? request.getStatus() : STATUS_DRAFT);
        project.setViews(0);

        project = projectRepository.save(project);
        publishVectorizeEvent(project, VectorizeEvent.EventAction.UPSERT);
        return toResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("项目不存在: " + id));

        mapRequestToEntity(request, project);
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        project = projectRepository.save(project);
        publishVectorizeEvent(project, VectorizeEvent.EventAction.UPSERT);
        return toResponse(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("项目不存在: " + id);
        }
        projectRepository.deleteById(id);
        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("project")
                .entityId(id)
                .action(VectorizeEvent.EventAction.DELETE)
                .build());
    }

    private void mapRequestToEntity(ProjectRequest request, Project project) {
        project.setTitle(request.getTitle());
        // Use categoryId for dynamic category system
        project.setCategoryId(request.getCategoryId());
        project.setLocation(request.getLocation());
        project.setCompletionDate(request.getCompletionDate());
        project.setOwner(request.getOwner());
        project.setDesigner(request.getDesigner());
        project.setContractor(request.getContractor());
        project.setDescription(request.getDescription());
        project.setBackground(request.getBackground());
        project.setDesignConcept(request.getDesignConcept());
        project.setCoverImage(request.getCoverImage());
        project.setHighlights(request.getHighlights());
        project.setProjectAwards(request.getProjectAwards());
        project.setScale(request.getScale());
        project.setTechnicalFeatures(request.getTechnicalFeatures());
        project.setAchievements(request.getAchievements());
        project.setImages(request.getImages());
    }

    private ProjectListResponse toListResponse(Project project) {
        ProjectListResponse response = new ProjectListResponse();
        response.setId(project.getId());
        response.setTitle(project.getTitle());
        response.setCategoryId(project.getCategoryId());
        response.setCategory(project.getCategory());
        response.setCategoryName(getCategoryNameFromEntity(project));
        response.setLocation(project.getLocation());
        response.setCompletionDate(project.getCompletionDate());
        response.setOwner(project.getOwner());
        response.setDesigner(project.getDesigner());
        response.setContractor(project.getContractor());
        response.setDescription(project.getDescription());
        response.setViews(project.getViews());
        response.setStatus(project.getStatus());
        response.setCoverImage(project.getCoverImage());
        response.setImages(project.getImages());
        response.setHighlights(project.getHighlights());
        response.setProjectAwards(project.getProjectAwards());
        return response;
    }

    private ProjectResponse toResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setTitle(project.getTitle());
        response.setCategoryId(project.getCategoryId());
        response.setCategory(project.getCategory());
        response.setCategoryName(getCategoryNameFromEntity(project));
        response.setLocation(project.getLocation());
        response.setCompletionDate(project.getCompletionDate());
        response.setOwner(project.getOwner());
        response.setDesigner(project.getDesigner());
        response.setContractor(project.getContractor());
        response.setDescription(project.getDescription());
        response.setBackground(project.getBackground());
        response.setDesignConcept(project.getDesignConcept());
        response.setViews(project.getViews());
        response.setStatus(project.getStatus());
        response.setCoverImage(project.getCoverImage());
        response.setCreatedTime(project.getCreatedTime());
        response.setUpdatedTime(project.getUpdatedTime());
        response.setHighlights(project.getHighlights());
        response.setProjectAwards(project.getProjectAwards());
        response.setScale(project.getScale());
        response.setTechnicalFeatures(project.getTechnicalFeatures());
        response.setAchievements(project.getAchievements());
        response.setImages(project.getImages());
        return response;
    }

    private String getCategoryName(ProjectCategory category) {
        if (category == null) return null;
        return switch (category) {
            case SMART_BUILDING -> "智能建筑";
            case GREEN_BUILDING -> "绿色建筑";
            case BIM_APPLICATION -> "BIM应用";
            case PREFABRICATED -> "装配式建筑";
            case RENOVATION -> "既有建筑改造";
        };
    }

    /**
     * Get category name from entity (dynamic category system)
     * Falls back to legacy enum if categoryId is not set
     */
    private String getCategoryNameFromEntity(Project project) {
        // First try to get from dynamic category entity
        if (project.getCategoryId() != null) {
            return projectCategoryRepository.findById(project.getCategoryId())
                    .map(ProjectCategoryEntity::getName)
                    .orElse(null);
        }
        // Fallback to legacy enum
        return getCategoryName(project.getCategory());
    }

    private void publishVectorizeEvent(Project project, VectorizeEvent.EventAction action) {
        Map<String, String> fields = new HashMap<>();
        fields.put("title", nullToEmpty(project.getTitle()));
        fields.put("description", nullToEmpty(project.getDescription()));
        fields.put("background", nullToEmpty(project.getBackground()));
        fields.put("designConcept", nullToEmpty(project.getDesignConcept()));
        fields.put("highlights", nullToEmpty(project.getHighlights()));
        fields.put("technicalFeatures", nullToEmpty(project.getTechnicalFeatures()));
        fields.put("achievements", nullToEmpty(project.getAchievements()));
        fields.put("location", nullToEmpty(project.getLocation()));
        fields.put("owner", nullToEmpty(project.getOwner()));
        fields.put("designer", nullToEmpty(project.getDesigner()));
        fields.put("contractor", nullToEmpty(project.getContractor()));
        fields.put("scale", nullToEmpty(project.getScale()));

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("title", project.getTitle());
        // Use dynamic category system
        if (project.getCategoryId() != null) {
            projectCategoryRepository.findById(project.getCategoryId())
                    .ifPresent(categoryEntity -> {
                        metadata.put("category", categoryEntity.getCode());
                        metadata.put("categoryName", categoryEntity.getName());
                    });
        } else if (project.getCategory() != null) {
            // Fallback to legacy enum for old data
            metadata.put("category", project.getCategory().name());
            metadata.put("categoryName", getCategoryName(project.getCategory()));
        }

        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("project")
                .entityId(project.getId())
                .action(action)
                .fields(fields)
                .metadata(metadata)
                .build());
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    @Override
    public String getEntityType() {
        return "project";
    }

    @Override
    public int resyncVectors() {
        List<Project> allProjects = projectRepository.findAll();
        for (Project project : allProjects) {
            publishVectorizeEvent(project, VectorizeEvent.EventAction.UPSERT);
        }
        return allProjects.size();
    }
}
