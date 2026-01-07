package com.assoc.product.dto;

import lombok.Data;

@Data
public class ProductListResponse {
    private Long id;
    private String name;
    private String categoryName;
    private Long categoryId;
    private String manufacturer;
    private String model;
    private String price;
    private String summary;
    private String description;
    private Integer status;
    private Long views;
    private Boolean featured;
    private String images;
}
