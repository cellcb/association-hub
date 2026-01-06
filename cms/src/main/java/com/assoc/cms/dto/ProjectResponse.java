package com.assoc.cms.dto;

import com.assoc.cms.entity.ProjectCategory;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProjectResponse {
    private Long id;
    private String title;
    private ProjectCategory category;
    private String categoryName;
    private String location;
    private LocalDate completionDate;
    private String owner;
    private String designer;
    private String contractor;
    private String description;
    private String background;
    private String designConcept;
    private Integer views;
    private Integer status;
    private String coverImage;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    // JSON string fields
    private String highlights;
    private String projectAwards;
    private String scale;
    private String technicalFeatures;
    private String achievements;
    private String images;
}
