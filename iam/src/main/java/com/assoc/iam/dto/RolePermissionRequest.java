package com.assoc.iam.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

@Data
public class RolePermissionRequest {
    
    // Allow empty list to clear all permissions; only disallow null
    @NotNull(message = "Permission IDs cannot be null")
    private Set<Long> permissionIds;
}
