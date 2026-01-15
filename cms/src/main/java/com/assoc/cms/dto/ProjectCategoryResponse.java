package com.assoc.cms.dto;

import lombok.Data;

@Data
public class ProjectCategoryResponse {
    private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
    private String description;
}
