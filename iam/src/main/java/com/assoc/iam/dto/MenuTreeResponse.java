package com.assoc.iam.dto;

import com.assoc.iam.entity.Menu;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Menu tree response for frontend navigation")
public class MenuTreeResponse {
    
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
    
    @Schema(description = "Child menus")
    private List<MenuTreeResponse> children;
    
    @Schema(description = "Has children")
    private Boolean hasChildren;
    
    @Schema(description = "Route meta information")
    private MenuMeta meta;
    
    @Data
    @Schema(description = "Menu meta information for frontend route")
    public static class MenuMeta {
        
        @Schema(description = "Menu title")
        private String title;
        
        @Schema(description = "Menu icon")
        private String icon;
        
        @Schema(description = "Hide in menu")
        private Boolean hideInMenu;
        
        @Schema(description = "Cache page")
        private Boolean keepAlive;
        
        @Schema(description = "Open target (_blank for new tab)")
        private String target;
        
        @Schema(description = "Menu order")
        private Integer order;
    }
}
