package com.assoc.cms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExpertiseFieldRequest {

    @NotBlank(message = "领域名称不能为空")
    @Size(max = 50, message = "领域名称不能超过50个字符")
    private String name;

    @NotBlank(message = "领域代码不能为空")
    @Size(max = 50, message = "领域代码不能超过50个字符")
    @Pattern(regexp = "^[a-z_]+$", message = "领域代码只能包含小写字母和下划线")
    private String code;

    @Min(value = 0, message = "排序值不能为负数")
    private Integer sortOrder = 0;

    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status = 1;

    @Size(max = 200, message = "描述不能超过200个字符")
    private String description;
}
