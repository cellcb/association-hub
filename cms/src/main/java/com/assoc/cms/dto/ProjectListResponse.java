package com.assoc.cms.dto;

import com.assoc.cms.entity.ProjectCategory;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectListResponse {
    private Long id;
    private String title;
    private Long categoryId;
    private ProjectCategory category;
    private String categoryName;
    private String location;
    private LocalDate completionDate;
    private String owner;
    private String designer;
    private String contractor;
    private String description;
    private Integer views;
    private Integer status;
    private String coverImage;
    private String images;
    // JSON string fields for list display
    private String highlights;
    private String projectAwards;
}
