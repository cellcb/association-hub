package com.assoc.iam.dto;

import com.assoc.iam.entity.Menu;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Schema(description = "Menu response")
public class MenuResponse {
    
    @Schema(description = "Menu ID")
    private Long id;
    
    @Schema(description = "Menu name")
    private String name;
    
    @Schema(description = "Menu code")
    private String code;
    
    @Schema(description = "Route path")
    private String path;
    
    @Schema(description = "Icon class name")
    private String icon;
    
    @Schema(description = "Frontend component path")
    private String component;
    
    @Schema(description = "Parent menu ID")
    private Long parentId;
    
    @Schema(description = "Parent menu name")
    private String parentName;
    
    @Schema(description = "Menu level in tree")
    private Integer level;
    
    @Schema(description = "Sort order")
    private Integer sortOrder;
    
    @Schema(description = "Menu type")
    private Menu.MenuType menuType;
    
    @Schema(description = "Is external link")
    private Boolean external;
    
    @Schema(description = "Cache page")
    private Boolean cache;
    
    @Schema(description = "Hide from menu")
    private Boolean hidden;
    
    @Schema(description = "Status")
    private Integer status;
    
    @Schema(description = "Creation time")
    private LocalDateTime createdTime;
    
    @Schema(description = "Last update time")
    private LocalDateTime updatedTime;
    
    @Schema(description = "Creator ID")
    private Long createdBy;
    
    @Schema(description = "Last updater ID")
    private Long updatedBy;
    
    @Schema(description = "Child menus")
    private List<MenuResponse> children;
    
    @Schema(description = "Permission codes associated with this menu")
    private Set<String> permissionCodes;
    
    @Schema(description = "Permissions associated with this menu")
    private List<PermissionResponse> permissions;
    
    @Schema(description = "Has children")
    private Boolean hasChildren;
    
    @Schema(description = "Is root menu")
    private Boolean isRoot;
}
