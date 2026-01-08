package com.assoc.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConfigRequest {

    @NotBlank(message = "配置键不能为空")
    @Size(max = 100, message = "配置键长度不能超过100字符")
    private String configKey;

    private String configValue;

    @NotBlank(message = "分类不能为空")
    @Size(max = 50, message = "分类长度不能超过50字符")
    private String category;

    @Size(max = 255, message = "描述长度不能超过255字符")
    private String description;

    private Integer sortOrder = 0;

    private Integer status = 1;
}
