package com.assoc.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "产品名称不能为空")
    private String name;

    private Long categoryId;
    private String manufacturer;
    private String description;
    private String application;
    private String contactPhone;
    private String contactEmail;
    private Integer status;

    // JSON string fields
    private String features;
    private String certifications;
    private String images;
    private String specifications;
}
