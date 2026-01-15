package com.assoc.cms.dto;

import com.assoc.cms.entity.Manufacturer;
import lombok.Data;

@Data
public class ManufacturerListResponse {
    private Long id;
    private String name;
    private String categoryName;
    private Long categoryId;
    private String logo;
    private String summary;
    private String address;
    private String mainBusiness;
    private Integer status;
    private Long views;
    private Boolean featured;

    public static ManufacturerListResponse from(Manufacturer entity) {
        ManufacturerListResponse dto = new ManufacturerListResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        if (entity.getCategory() != null) {
            dto.setCategoryName(entity.getCategory().getName());
            dto.setCategoryId(entity.getCategory().getId());
        }
        dto.setLogo(entity.getLogo());
        dto.setSummary(entity.getSummary());
        dto.setAddress(entity.getAddress());
        dto.setMainBusiness(entity.getMainBusiness());
        dto.setStatus(entity.getStatus());
        dto.setViews(entity.getViews());
        dto.setFeatured(entity.getFeatured());
        return dto;
    }
}
