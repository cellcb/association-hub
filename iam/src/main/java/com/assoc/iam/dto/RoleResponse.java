package com.assoc.iam.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RoleResponse {
    
    private Long id;
    private String name;
    private String code;
    private String description;
    private Integer status;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    private Long createdBy;
    private Long updatedBy;
}
