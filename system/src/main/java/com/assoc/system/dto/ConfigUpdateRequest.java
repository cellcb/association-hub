package com.assoc.system.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConfigUpdateRequest {

    private String configValue;

    @Size(max = 255, message = "描述长度不能超过255字符")
    private String description;

    private Integer sortOrder;

    private Integer status;
}
