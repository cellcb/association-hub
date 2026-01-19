package com.assoc.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductCategoryRequest {

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称不能超过100个字符")
    private String name;

    @Size(max = 50, message = "分类代码不能超过50个字符")
    @Pattern(regexp = "^$|^[A-Z0-9_]+$", message = "分类代码只能包含大写字母、数字和下划线")
    private String code;

    private Long parentId;

    @Min(value = 0, message = "排序值不能小于0")
    private Integer sortOrder = 0;

    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status = 1;

    @Size(max = 500, message = "描述不能超过500个字符")
    private String description;
}
