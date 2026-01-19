package com.assoc.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank(message = "项目名称不能为空")
    @Size(max = 200, message = "项目名称不能超过200个字符")
    private String title;

    @NotNull(message = "项目类别不能为空")
    private Long categoryId;

    @Size(max = 200, message = "项目地点不能超过200个字符")
    private String location;
    private LocalDate completionDate;
    @Size(max = 200, message = "建设单位名称不能超过200个字符")
    private String owner;
    @Size(max = 200, message = "设计单位名称不能超过200个字符")
    private String designer;
    @Size(max = 200, message = "施工单位名称不能超过200个字符")
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
