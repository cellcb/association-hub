package com.assoc.cms.dto;

import com.assoc.cms.entity.ProjectCategory;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectListResponse {
    private Long id;
    private String title;
    private ProjectCategory category;
    private String categoryName;
    private String location;
    private LocalDate completionDate;
    private String owner;
    private Integer views;
    private Integer status;
    private String coverImage;
    private String images;
}
