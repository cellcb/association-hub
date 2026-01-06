package com.assoc.product.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private ProductCategoryResponse category;
    private String manufacturer;
    private String description;
    private String application;
    private String contactPhone;
    private String contactEmail;
    private Integer status;
    private Long views;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    // JSON string fields
    private String features;
    private String certifications;
    private String images;
    private String specifications;
}
