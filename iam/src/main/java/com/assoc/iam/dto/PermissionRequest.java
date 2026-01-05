package com.assoc.iam.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class PermissionRequest {
    
    @NotBlank(message = "Permission name cannot be blank")
    @Size(max = 50, message = "Permission name cannot exceed 50 characters")
    private String name;
    
    @NotBlank(message = "Permission code cannot be blank")
    @Size(max = 50, message = "Permission code cannot exceed 50 characters")
    private String code;
    
    @Size(max = 100, message = "Resource cannot exceed 100 characters")
    private String resource;
    
    @Size(max = 50, message = "Action cannot exceed 50 characters")
    private String action;
    
    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;
    
    private Integer status = 1;
}
