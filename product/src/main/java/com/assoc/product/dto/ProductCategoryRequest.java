package com.assoc.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductCategoryRequest {

    @NotBlank(message = "分类名称不能为空")
    private String name;

    private String code;

    private Long parentId;

    private Integer sortOrder = 0;

    private Integer status = 1;

    private String description;
}
