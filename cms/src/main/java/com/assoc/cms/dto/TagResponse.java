package com.assoc.cms.dto;

import lombok.Data;

@Data
public class TagResponse {
    private Long id;
    private String name;
    private Integer usageCount;
}
