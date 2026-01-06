package com.assoc.cms.dto;

import lombok.Data;

@Data
public class ExpertiseFieldResponse {
    private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
}
