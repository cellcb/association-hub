package com.assoc.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "产品名称不能为空")
    @Size(max = 255, message = "产品名称不能超过255个字符")
    private String name;

    private Long categoryId;

    @Size(max = 255, message = "生产厂商不能超过255个字符")
    private String manufacturer;

    @Size(max = 100, message = "产品型号不能超过100个字符")
    private String model;

    @Size(max = 100, message = "产品价格不能超过100个字符")
    private String price;

    @Size(max = 500, message = "产品摘要不能超过500个字符")
    private String summary;

    private String description;
    private String application;

    @Size(max = 20, message = "联系电话不能超过20个字符")
    @Pattern(regexp = "^$|^[0-9+\\-()\\s]+$", message = "联系电话格式不正确")
    private String contactPhone;

    @Size(max = 100, message = "联系邮箱不能超过100个字符")
    @Email(message = "联系邮箱格式不正确")
    private String contactEmail;

    @Size(max = 100, message = "联系人不能超过100个字符")
    private String contact;

    @Size(max = 255, message = "官方网站不能超过255个字符")
    private String website;

    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;

    private Boolean featured;

    // JSON string fields
    private String features;
    private String certifications;
    private String images;
    private String specifications;
}
