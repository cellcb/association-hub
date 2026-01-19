package com.assoc.cms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ManufacturerRequest {
    @NotBlank(message = "厂商名称不能为空")
    @Size(max = 255, message = "厂商名称不能超过255个字符")
    private String name;

    private Long categoryId;
    private String logo;
    private String summary;
    private String description;

    @Size(max = 50, message = "联系电话不能超过50个字符")
    private String contactPhone;

    @Email(message = "联系邮箱格式不正确")
    @Size(max = 100, message = "联系邮箱不能超过100个字符")
    private String contactEmail;

    @Size(max = 100, message = "联系人不能超过100个字符")
    private String contactPerson;

    @Size(max = 500, message = "地址不能超过500个字符")
    private String address;

    @Size(max = 255, message = "网址不能超过255个字符")
    private String website;

    private String establishedDate;

    @Size(max = 100, message = "注册资本不能超过100个字符")
    private String registeredCapital;

    @Size(max = 50, message = "员工规模不能超过50个字符")
    private String employeeScale;

    private String mainBusiness;
    private String qualifications;
    private String honors;
    private String images;

    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;

    private Boolean featured;
}
