package com.assoc.iam.service;

import com.assoc.iam.dto.MenuRequest;
import com.assoc.iam.dto.MenuResponse;
import com.assoc.iam.dto.MenuTreeResponse;

import java.util.List;

public interface MenuService {
    
    /**
     * Get all menus as tree structure
     */
    List<MenuTreeResponse> getMenuTree();
    
    /**
     * Get user accessible menus as tree structure
     */
    List<MenuTreeResponse> getUserMenuTree(Long userId);
    
    /**
     * Get all menus (flat list)
     */
    List<MenuResponse> getAllMenus();
    
    /**
     * Get menu by ID
     */
    MenuResponse getMenuById(Long id);
    
    /**
     * Get menu by code
     */
    MenuResponse getMenuByCode(String code);
    
    /**
     * Get root menus
     */
    List<MenuResponse> getRootMenus();
    
    /**
     * Get children menus by parent ID
     */
    List<MenuResponse> getChildrenMenus(Long parentId);
    
    /**
     * Search menus by name
     */
    List<MenuResponse> searchMenusByName(String name);
    
    /**
     * Create new menu
     */
    MenuResponse createMenu(MenuRequest request, Long operatorId);
    
    /**
     * Update menu
     */
    MenuResponse updateMenu(Long id, MenuRequest request, Long operatorId);
    
    /**
     * Delete menu
     */
    void deleteMenu(Long id, Long operatorId);
    
    /**
     * Move menu to new parent
     */
    MenuResponse moveMenu(Long menuId, Long newParentId, Long operatorId);
    
    /**
     * Check if menu code exists
     */
    boolean existsByCode(String code);
    
    /**
     * Check if menu has children
     */
    boolean hasChildren(Long menuId);
    
    /**
     * Validate menu hierarchy (prevent circular reference)
     */
    boolean validateMenuHierarchy(Long menuId, Long parentId);
    
    /**
     * Add permissions to menu
     */
    void addPermissionsToMenu(Long menuId, List<Long> permissionIds, Long operatorId);
    
    /**
     * Remove permissions from menu
     */
    void removePermissionsFromMenu(Long menuId, List<Long> permissionIds, Long operatorId);
    
    /**
     * Update menu permissions (replace all)
     */
    void updateMenuPermissions(Long menuId, List<Long> permissionIds, Long operatorId);
    
    /**
     * Get menu permissions
     */
    List<com.assoc.iam.dto.PermissionResponse> getMenuPermissions(Long menuId);
}
