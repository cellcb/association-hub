package com.assoc.cms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ExpertRequest {
    @NotBlank(message = "姓名不能为空")
    @Size(max = 50, message = "姓名不能超过50个字符")
    private String name;

    @Size(max = 100, message = "职称不能超过100个字符")
    private String title;

    @Size(max = 200, message = "所在单位不能超过200个字符")
    private String organization;

    @Size(max = 100, message = "所在地区不能超过100个字符")
    private String location;

    private String achievements;

    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱不能超过100个字符")
    private String email;

    @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "手机号格式不正确")
    @Size(max = 20, message = "手机号不能超过20个字符")
    private String phone;

    private String avatar;
    private String bio;

    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;

    private List<Long> expertiseFieldIds;

    // JSON string fields
    private String education;
    private String experience;
    private String projects;
    private String publications;
    private String awards;
    private String researchAreas;
}
