package com.assoc.iam.security;

import com.assoc.iam.service.DynamicPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
@Slf4j
public class DynamicPermissionEvaluator implements PermissionEvaluator {
    
    private final DynamicPermissionService dynamicPermissionService;
    
    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Long userId = userPrincipal.getId();
            
            // 如果targetDomainObject是资源路径字符串，permission是HTTP方法
            if (targetDomainObject instanceof String && permission instanceof String) {
                String resourcePath = (String) targetDomainObject;
                String httpMethod = (String) permission;
                return dynamicPermissionService.hasPermission(userId, resourcePath, httpMethod);
            }
            
            // 如果permission是权限代码字符串
            if (permission instanceof String) {
                String permissionCode = (String) permission;
                return dynamicPermissionService.getUserPermissions(userId).contains(permissionCode);
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("权限评估时发生错误", e);
            return false;
        }
    }
    
    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        // 这个方法可以用于基于ID的权限检查，比如检查用户是否能访问特定的资源实例
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Long userId = userPrincipal.getId();
            
            // 根据targetType构建资源路径
            String resourcePath = buildResourcePath(targetType, targetId);
            String httpMethod = permission != null ? permission.toString() : "GET";
            
            return dynamicPermissionService.hasPermission(userId, resourcePath, httpMethod);
            
        } catch (Exception e) {
            log.error("基于ID的权限评估时发生错误: targetId={}, targetType={}, permission={}", 
                     targetId, targetType, permission, e);
            return false;
        }
    }
    
    /**
     * 根据目标类型和ID构建资源路径
     */
    private String buildResourcePath(String targetType, Serializable targetId) {
        return switch (targetType.toLowerCase()) {
            case "user" -> "/api/iam/users/" + targetId;
            case "role" -> "/api/iam/roles/" + targetId;
            case "permission" -> "/api/iam/permissions/" + targetId;
            case "department" -> "/api/iam/departments/" + targetId;
            case "menu" -> "/api/iam/menus/" + targetId;
            default -> "/api/" + targetType + "s/" + targetId;
        };
    }
}
