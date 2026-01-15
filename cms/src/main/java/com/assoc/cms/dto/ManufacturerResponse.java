package com.assoc.cms.dto;

import com.assoc.cms.entity.Manufacturer;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ManufacturerResponse {
    private Long id;
    private String name;
    private ManufacturerCategoryResponse category;
    private String logo;
    private String summary;
    private String description;
    private String contactPhone;
    private String contactEmail;
    private String contactPerson;
    private String address;
    private String website;
    private LocalDate establishedDate;
    private String registeredCapital;
    private String employeeScale;
    private String mainBusiness;
    private String qualifications;
    private String honors;
    private String cases;
    private String images;
    private Integer status;
    private Long views;
    private Boolean featured;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    public static ManufacturerResponse from(Manufacturer entity) {
        ManufacturerResponse dto = new ManufacturerResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        if (entity.getCategory() != null) {
            dto.setCategory(ManufacturerCategoryResponse.from(entity.getCategory()));
        }
        dto.setLogo(entity.getLogo());
        dto.setSummary(entity.getSummary());
        dto.setDescription(entity.getDescription());
        dto.setContactPhone(entity.getContactPhone());
        dto.setContactEmail(entity.getContactEmail());
        dto.setContactPerson(entity.getContactPerson());
        dto.setAddress(entity.getAddress());
        dto.setWebsite(entity.getWebsite());
        dto.setEstablishedDate(entity.getEstablishedDate());
        dto.setRegisteredCapital(entity.getRegisteredCapital());
        dto.setEmployeeScale(entity.getEmployeeScale());
        dto.setMainBusiness(entity.getMainBusiness());
        dto.setQualifications(entity.getQualifications());
        dto.setHonors(entity.getHonors());
        dto.setCases(entity.getCases());
        dto.setImages(entity.getImages());
        dto.setStatus(entity.getStatus());
        dto.setViews(entity.getViews());
        dto.setFeatured(entity.getFeatured());
        dto.setCreatedTime(entity.getCreatedTime());
        dto.setUpdatedTime(entity.getUpdatedTime());
        return dto;
    }
}
