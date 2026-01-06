package com.assoc.product.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductCategoryResponse {
    private Long id;
    private String name;
    private String code;
    private Long parentId;
    private Integer sortOrder;
    private Integer status;
    private String description;
    private List<ProductCategoryResponse> children;
}
