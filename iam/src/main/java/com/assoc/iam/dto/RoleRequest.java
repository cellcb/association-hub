package com.assoc.iam.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

@Data
public class RoleRequest {
    
    @NotBlank(message = "Role name cannot be blank")
    @Size(max = 50, message = "Role name cannot exceed 50 characters")
    private String name;
    
    @NotBlank(message = "Role code cannot be blank")
    @Size(max = 50, message = "Role code cannot exceed 50 characters")
    private String code;
    
    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;
    
    private Integer status = 1;
    
    private Set<Long> permissionIds;
}
