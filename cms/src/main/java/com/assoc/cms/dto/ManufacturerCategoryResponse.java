package com.assoc.cms.dto;

import com.assoc.cms.entity.ManufacturerCategory;
import lombok.Data;

import java.util.List;

@Data
public class ManufacturerCategoryResponse {
    private Long id;
    private String name;
    private String code;
    private Long parentId;
    private Integer sortOrder;
    private Integer status;
    private String description;
    private List<ManufacturerCategoryResponse> children;

    public static ManufacturerCategoryResponse from(ManufacturerCategory entity) {
        ManufacturerCategoryResponse dto = new ManufacturerCategoryResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCode(entity.getCode());
        dto.setParentId(entity.getParentId());
        dto.setSortOrder(entity.getSortOrder());
        dto.setStatus(entity.getStatus());
        dto.setDescription(entity.getDescription());
        return dto;
    }
}
