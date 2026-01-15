package com.assoc.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ManufacturerRequest {
    @NotBlank(message = "厂商名称不能为空")
    private String name;

    private Long categoryId;
    private String logo;
    private String summary;
    private String description;
    private String contactPhone;
    private String contactEmail;
    private String contactPerson;
    private String address;
    private String website;
    private String establishedDate;
    private String registeredCapital;
    private String employeeScale;
    private String mainBusiness;
    private String qualifications;
    private String honors;
    private String images;
    private Integer status;
    private Boolean featured;
}
