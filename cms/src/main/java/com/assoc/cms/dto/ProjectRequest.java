package com.assoc.cms.dto;

import com.assoc.cms.entity.ProjectCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank(message = "项目名称不能为空")
    private String title;

    @NotNull(message = "项目类别不能为空")
    private ProjectCategory category;

    private String location;
    private LocalDate completionDate;
    private String owner;
    private String designer;
    private String contractor;
    private String description;
    private String background;
    private String designConcept;
    private Integer status;
    private String coverImage;

    // JSON string fields
    private String highlights;
    private String projectAwards;
    private String scale;
    private String technicalFeatures;
    private String achievements;
    private String images;
}
