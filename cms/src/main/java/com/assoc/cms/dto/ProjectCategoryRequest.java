package com.assoc.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectCategoryRequest {
    @NotBlank(message = "类别名称不能为空")
    private String name;

    private String code;
    private Integer sortOrder = 0;
    private Integer status = 1;
    private String description;
}
