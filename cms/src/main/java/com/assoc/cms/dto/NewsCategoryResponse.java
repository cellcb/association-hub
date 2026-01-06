package com.assoc.cms.dto;

import lombok.Data;

@Data
public class NewsCategoryResponse {
    private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
}
