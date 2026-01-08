package com.assoc.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConfigResponse {
    private Long id;
    private String configKey;
    private String configValue;
    private String category;
    private String description;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
}
