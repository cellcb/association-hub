package com.assoc.iam.controller;

import com.assoc.common.Result;
import com.assoc.iam.entity.Permission;
import com.assoc.iam.service.PermissionConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/iam/permissions/config")
@Tag(name = "权限配置管理", description = "动态权限配置管理接口（原路径：/api/permission-config）")
@RequiredArgsConstructor
public class PermissionConfigController {
    
    private final PermissionConfigService permissionConfigService;
    
    /**
     * 获取所有权限配置
     */
    @GetMapping
    @Operation(summary = "获取权限配置列表", description = "获取所有权限配置信息")
    public Result<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionConfigService.getAllPermissionConfigs();
        return Result.success(permissions);
    }
    
    /**
     * 添加权限配置
     */
    @PostMapping
    @Operation(summary = "添加权限配置", description = "添加新的权限配置")
    public Result<Permission> addPermission(@RequestBody PermissionRequest request) {
        Permission permission = permissionConfigService.addPermissionConfig(
            request.getName(),
            request.getCode(),
            request.getResource(),
            request.getAction(),
            request.getDescription()
        );
        return Result.success(permission);
    }
    
    /**
     * 更新权限配置
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新权限配置", description = "更新指定的权限配置")
    public Result<Permission> updatePermission(@PathVariable Long id, @RequestBody PermissionRequest request) {
        Permission permission = permissionConfigService.updatePermissionConfig(
            id,
            request.getName(),
            request.getCode(),
            request.getResource(),
            request.getAction(),
            request.getDescription()
        );
        return Result.success(permission);
    }
    
    /**
     * 删除权限配置
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除权限配置", description = "删除指定的权限配置")
    public Result<Void> deletePermission(@PathVariable Long id) {
        permissionConfigService.deletePermissionConfig(id);
        return Result.success(null);
    }
    
    /**
     * 启用/禁用权限
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "修改权限状态", description = "启用或禁用指定的权限配置")
    public Result<Void> togglePermissionStatus(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer status = request.get("status");
        permissionConfigService.togglePermissionStatus(id, status);
        return Result.success(null);
    }
    
    /**
     * 批量添加常用API权限
     */
    @PostMapping("/batch/api")
    @Operation(summary = "批量添加API权限", description = "批量添加常用的API权限配置")
    public Result<Void> batchAddApiPermissions() {
        List<PermissionConfigService.ApiPermissionConfig> configs = Arrays.asList(
            // 用户管理API
            new PermissionConfigService.ApiPermissionConfig("用户列表", "API_USER_LIST", "/api/iam/users", "GET", "获取用户列表"),
            new PermissionConfigService.ApiPermissionConfig("用户详情", "API_USER_DETAIL", "/api/iam/users/*", "GET", "获取用户详情"),
            new PermissionConfigService.ApiPermissionConfig("创建用户", "API_USER_CREATE", "/api/iam/users", "POST", "创建新用户"),
            new PermissionConfigService.ApiPermissionConfig("更新用户", "API_USER_UPDATE", "/api/iam/users/*", "PUT", "更新用户信息"),
            new PermissionConfigService.ApiPermissionConfig("删除用户", "API_USER_DELETE", "/api/iam/users/*", "DELETE", "删除用户"),
            
            // 部门管理API
            new PermissionConfigService.ApiPermissionConfig("部门列表", "API_DEPT_LIST", "/api/iam/departments", "GET", "获取部门列表"),
            new PermissionConfigService.ApiPermissionConfig("部门树", "API_DEPT_TREE", "/api/iam/departments/tree", "GET", "获取部门树结构"),
            new PermissionConfigService.ApiPermissionConfig("部门详情", "API_DEPT_DETAIL", "/api/iam/departments/*", "GET", "获取部门详情"),
            new PermissionConfigService.ApiPermissionConfig("创建部门", "API_DEPT_CREATE", "/api/iam/departments", "POST", "创建新部门"),
            new PermissionConfigService.ApiPermissionConfig("更新部门", "API_DEPT_UPDATE", "/api/iam/departments/*", "PUT", "更新部门信息"),
            new PermissionConfigService.ApiPermissionConfig("删除部门", "API_DEPT_DELETE", "/api/iam/departments/*", "DELETE", "删除部门"),
            
            // 菜单管理API
            new PermissionConfigService.ApiPermissionConfig("菜单列表", "API_MENU_LIST", "/api/iam/menus", "GET", "获取菜单列表"),
            new PermissionConfigService.ApiPermissionConfig("菜单树", "API_MENU_TREE", "/api/iam/menus/tree", "GET", "获取菜单树结构"),
            new PermissionConfigService.ApiPermissionConfig("菜单详情", "API_MENU_DETAIL", "/api/iam/menus/*", "GET", "获取菜单详情"),
            new PermissionConfigService.ApiPermissionConfig("创建菜单", "API_MENU_CREATE", "/api/iam/menus", "POST", "创建新菜单"),
            new PermissionConfigService.ApiPermissionConfig("更新菜单", "API_MENU_UPDATE", "/api/iam/menus/*", "PUT", "更新菜单信息"),
            new PermissionConfigService.ApiPermissionConfig("删除菜单", "API_MENU_DELETE", "/api/iam/menus/*", "DELETE", "删除菜单")
        );
        
        permissionConfigService.batchAddApiPermissions(configs);
        return Result.success(null);
    }
    
    /**
     * 根据资源查找权限
     */
    @GetMapping("/search")
    @Operation(summary = "搜索权限配置", description = "根据资源路径搜索权限配置")
    public Result<List<Permission>> searchPermissions(@RequestParam String resource) {
        List<Permission> permissions = permissionConfigService.getPermissionsByResource(resource);
        return Result.success(permissions);
    }
    
    /**
     * 清除权限缓存
     */
    @PostMapping("/cache/clear")
    @Operation(summary = "清除权限缓存", description = "清除所有权限相关缓存")
    public Result<Void> clearPermissionCache() {
        permissionConfigService.clearAllPermissionCache();
        return Result.success(null);
    }
    
    /**
     * 权限请求DTO
     */
    public static class PermissionRequest {
        private String name;
        private String code;
        private String resource;
        private String action;
        private String description;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getResource() { return resource; }
        public void setResource(String resource) { this.resource = resource; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}
