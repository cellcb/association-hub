package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.iam.dto.MenuRequest;
import com.assoc.iam.dto.MenuResponse;
import com.assoc.iam.dto.MenuTreeResponse;
import com.assoc.iam.dto.PermissionResponse;
import com.assoc.iam.security.UserPrincipal;
import com.assoc.iam.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
 
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/iam/menus")
@RequiredArgsConstructor
@Tag(name = "Menu Management", description = "APIs for menu management (原路径：/api/iam/menus)")
public class MenuController {
    
    private final MenuService menuService;
    
    @GetMapping("/tree")
    @Operation(summary = "Get complete menu tree", description = "Get all menus organized in tree structure")
    public Result<List<MenuTreeResponse>> getMenuTree() {
        List<MenuTreeResponse> menuTree = menuService.getMenuTree();
        return Result.success(menuTree);
    }
    
    @GetMapping("/user-menus")
    @Operation(summary = "Get user accessible menu tree", description = "Get menus that current user can access")
    public Result<List<MenuTreeResponse>> getUserMenuTree(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<MenuTreeResponse> menuTree = menuService.getUserMenuTree(userPrincipal.getId());
        return Result.success(menuTree);
    }
    
    @GetMapping
    @Operation(summary = "Get all menus", description = "Get all menus as flat list")
    public Result<List<MenuResponse>> getAllMenus() {
        List<MenuResponse> menus = menuService.getAllMenus();
        return Result.success(menus);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get menu by ID", description = "Get menu details by ID")
    public Result<MenuResponse> getMenuById(
            @Parameter(description = "Menu ID") @PathVariable Long id) {
        MenuResponse menu = menuService.getMenuById(id);
        return Result.success(menu);
    }
    
    @GetMapping("/code/{code}")
    @Operation(summary = "Get menu by code", description = "Get menu details by code")
    public Result<MenuResponse> getMenuByCode(
            @Parameter(description = "Menu code") @PathVariable String code) {
        MenuResponse menu = menuService.getMenuByCode(code);
        return Result.success(menu);
    }
    
    @GetMapping("/roots")
    @Operation(summary = "Get root menus", description = "Get all root level menus")
    public Result<List<MenuResponse>> getRootMenus() {
        List<MenuResponse> rootMenus = menuService.getRootMenus();
        return Result.success(rootMenus);
    }
    
    @GetMapping("/{parentId}/children")
    @Operation(summary = "Get children menus", description = "Get child menus by parent ID")
    public Result<List<MenuResponse>> getChildrenMenus(
            @Parameter(description = "Parent menu ID") @PathVariable Long parentId) {
        List<MenuResponse> children = menuService.getChildrenMenus(parentId);
        return Result.success(children);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search menus by name", description = "Search menus by name (case insensitive)")
    public Result<List<MenuResponse>> searchMenus(
            @Parameter(description = "Menu name to search") @RequestParam String name) {
        List<MenuResponse> menus = menuService.searchMenusByName(name);
        return Result.success(menus);
    }
    
    @PostMapping
    @Operation(summary = "Create new menu", description = "Create a new menu")
    public Result<MenuResponse> createMenu(
            @Valid @RequestBody MenuRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        MenuResponse menu = menuService.createMenu(request, userPrincipal.getId());
        return Result.success(menu);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update menu", description = "Update an existing menu")
    public Result<MenuResponse> updateMenu(
            @Parameter(description = "Menu ID") @PathVariable Long id,
            @Valid @RequestBody MenuRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        MenuResponse menu = menuService.updateMenu(id, request, userPrincipal.getId());
        return Result.success(menu);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete menu", description = "Delete a menu")
    public Result<Void> deleteMenu(
            @Parameter(description = "Menu ID") @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        menuService.deleteMenu(id, userPrincipal.getId());
        return Result.success();
    }
    
    @PatchMapping("/{id}/move")
    @Operation(summary = "Move menu", description = "Move menu to a new parent")
    public Result<MenuResponse> moveMenu(
            @Parameter(description = "Menu ID") @PathVariable Long id,
            @Parameter(description = "New parent ID") @RequestParam(required = false) Long parentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        MenuResponse menu = menuService.moveMenu(id, parentId, userPrincipal.getId());
        return Result.success(menu);
    }
    
    @GetMapping("/exists")
    @Operation(summary = "Check if menu code exists", description = "Check if a menu code already exists")
    public Result<Boolean> existsByCode(
            @Parameter(description = "Menu code to check") @RequestParam String code) {
        boolean exists = menuService.existsByCode(code);
        return Result.success(exists);
    }
    
    @GetMapping("/{id}/has-children")
    @Operation(summary = "Check if menu has children", description = "Check if menu has child menus")
    public Result<Boolean> hasChildren(
            @Parameter(description = "Menu ID") @PathVariable Long id) {
        boolean hasChildren = menuService.hasChildren(id);
        return Result.success(hasChildren);
    }
    
    @PostMapping("/{id}/permissions")
    @Operation(summary = "给菜单添加权限", description = "为指定菜单添加权限列表")
    public Result<Void> addPermissionsToMenu(
            @Parameter(description = "菜单ID") @PathVariable Long id,
            @Parameter(description = "权限ID列表") @RequestBody List<Long> permissionIds,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        menuService.addPermissionsToMenu(id, permissionIds, userPrincipal.getId());
        return Result.success();
    }
    
    @DeleteMapping("/{id}/permissions")
    @Operation(summary = "移除菜单权限", description = "从菜单中移除指定的权限")
    public Result<Void> removePermissionsFromMenu(
            @Parameter(description = "菜单ID") @PathVariable Long id,
            @Parameter(description = "要移除的权限ID列表") @RequestBody List<Long> permissionIds,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        menuService.removePermissionsFromMenu(id, permissionIds, userPrincipal.getId());
        return Result.success();
    }
    
    @PutMapping("/{id}/permissions")
    @Operation(summary = "更新菜单权限", description = "替换菜单的所有权限")
    public Result<Void> updateMenuPermissions(
            @Parameter(description = "菜单ID") @PathVariable Long id,
            @Parameter(description = "新的权限ID列表") @RequestBody List<Long> permissionIds,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        menuService.updateMenuPermissions(id, permissionIds, userPrincipal.getId());
        return Result.success();
    }
    
    @GetMapping("/{id}/permissions")
    @Operation(summary = "获取菜单权限", description = "获取菜单关联的所有权限信息")
    public Result<List<PermissionResponse>> getMenuPermissions(
            @Parameter(description = "菜单ID") @PathVariable Long id) {
        List<PermissionResponse> permissions = menuService.getMenuPermissions(id);
        return Result.success(permissions);
    }
}
