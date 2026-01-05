package com.assoc.iam.dto;

import com.assoc.iam.entity.Menu;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
@Schema(description = "Menu creation/update request")
public class MenuRequest {
    
    @NotBlank(message = "Menu name cannot be blank")
    @Size(max = 50, message = "Menu name cannot exceed 50 characters")
    @Schema(description = "Menu name", example = "System Management")
    private String name;
    
    @NotBlank(message = "Menu code cannot be blank")
    @Size(max = 50, message = "Menu code cannot exceed 50 characters")
    @Schema(description = "Unique menu code", example = "SYSTEM_MANAGE")
    private String code;
    
    @Size(max = 200, message = "Path cannot exceed 200 characters")
    @Schema(description = "Route path for frontend", example = "/system")
    private String path;
    
    @Size(max = 50, message = "Icon cannot exceed 50 characters")
    @Schema(description = "Icon class name", example = "system")
    private String icon;
    
    @Size(max = 200, message = "Component cannot exceed 200 characters")
    @Schema(description = "Frontend component path", example = "System/index")
    private String component;
    
    @Schema(description = "Parent menu ID")
    private Long parentId;
    
    @Schema(description = "Sort order", example = "1")
    private Integer sortOrder = 0;
    
    @NotNull(message = "Menu type cannot be null")
    @Schema(description = "Menu type", example = "MENU")
    private Menu.MenuType menuType = Menu.MenuType.MENU;
    
    @Schema(description = "Is external link", example = "false")
    private Boolean external = false;
    
    @Schema(description = "Cache page", example = "false")
    private Boolean cache = false;
    
    @Schema(description = "Hide from menu", example = "false")
    private Boolean hidden = false;
    
    @Schema(description = "Status (1:active, 0:inactive)", example = "1")
    private Integer status = 1;
    
    @Schema(description = "Permission IDs associated with this menu")
    private Set<Long> permissionIds;
}
