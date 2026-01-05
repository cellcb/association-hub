package com.assoc.iam.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PermissionResponse {
    
    private Long id;
    private String name;
    private String code;
    private String resource;
    private String action;
    private String description;
    private Integer status;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    private Long createdBy;
    private Long updatedBy;
}
