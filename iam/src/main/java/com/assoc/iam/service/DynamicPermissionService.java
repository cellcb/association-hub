package com.assoc.iam.service;

import com.assoc.iam.entity.Permission;
import com.assoc.iam.entity.User;
import com.assoc.iam.repository.PermissionRepository;
import com.assoc.iam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicPermissionService {
    
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    
    /**
     * 检查用户是否有访问指定资源的权限
     * 
     * @param userId 用户ID
     * @param requestPath 请求路径 (如: /api/iam/users/123)
     * @param httpMethod HTTP方法 (如: GET, POST, PUT, DELETE)
     * @return 是否有权限
     */
    public boolean hasPermission(Long userId, String requestPath, String httpMethod) {
        try {
            // 获取用户所有权限
            Set<String> userPermissions = getUserPermissions(userId);
            if (userPermissions.isEmpty()) {
                log.debug("用户 {} 没有任何权限", userId);
                return false;
            }
            
            // 获取匹配的权限要求
            List<Permission> matchingPermissions = getMatchingPermissions(requestPath, httpMethod);
            if (matchingPermissions.isEmpty()) {
                log.debug("路径 {} {} 没有声明权限，默认拒绝访问", httpMethod, requestPath);
                return false;
            }
            
            // 检查是否有任何一个匹配的权限
            for (Permission permission : matchingPermissions) {
                if (userPermissions.contains(permission.getCode())) {
                    log.debug("用户 {} 有权限 {} 访问 {} {}", userId, permission.getCode(), httpMethod, requestPath);
                    return true;
                }
            }
            
            log.debug("用户 {} 没有权限访问 {} {}", userId, httpMethod, requestPath);
            return false;
            
        } catch (Exception e) {
            log.error("检查权限时发生错误: userId={}, path={}, method={}", userId, requestPath, httpMethod, e);
            // 发生异常时，出于安全考虑，拒绝访问
            return false;
        }
    }
    
    /**
     * 获取用户所有权限代码
     */
    @Cacheable(value = "userPermissions", key = "#userId")
    @Transactional(readOnly = true)
    public Set<String> getUserPermissions(Long userId) {
        Optional<User> userOpt = userRepository.findByIdWithRolesAndPermissions(userId);
        if (userOpt.isEmpty()) {
            return Set.of();
        }
        
        User user = userOpt.get();
        return user.getRoles().stream()
                .filter(role -> role.getStatus() == 1) // 只考虑激活的角色
                .flatMap(role -> role.getPermissions().stream())
                .filter(permission -> permission.getStatus() == 1) // 只考虑激活的权限
                .map(Permission::getCode)
                .collect(Collectors.toSet());
    }
    
    /**
     * 获取匹配请求路径和方法的权限配置
     */
    @Cacheable(value = "pathPermissions", key = "#requestPath + '_' + #httpMethod")
    public List<Permission> getMatchingPermissions(String requestPath, String httpMethod) {
        List<Permission> allPermissions = permissionRepository.findByStatus(1);
        
        return allPermissions.stream()
                .filter(permission -> matchesPath(permission.getResource(), requestPath))
                .filter(permission -> matchesMethod(permission.getAction(), httpMethod))
                .collect(Collectors.toList());
    }
    
    /**
     * 检查路径是否匹配
     * 支持Ant路径模式匹配，如 /api/iam/users/* 匹配 /api/iam/users/123
     */
    private boolean matchesPath(String patternPath, String requestPath) {
        if (patternPath == null || requestPath == null) {
            return false;
        }

        if (patternPath.startsWith("regex:")) {
            // 支持通过正则表达式定义资源（以 regex: 前缀标识）
            String regex = patternPath.substring("regex:".length());
            return Pattern.compile(regex).matcher(requestPath).matches();
        }

        // 如果是完全匹配
        if (patternPath.equals(requestPath)) {
            return true;
        }

        return pathMatcher.match(patternPath, requestPath);
    }
    
    /**
     * 检查HTTP方法是否匹配
     */
    private boolean matchesMethod(String permissionAction, String httpMethod) {
        if (permissionAction == null || httpMethod == null) {
            return false;
        }
        
        // 直接匹配HTTP方法
        if (permissionAction.equalsIgnoreCase(httpMethod)) {
            return true;
        }
        
        // 支持CRUD动作到HTTP方法的映射
        return switch (permissionAction.toUpperCase()) {
            case "CREATE" -> "POST".equalsIgnoreCase(httpMethod);
            case "READ" -> "GET".equalsIgnoreCase(httpMethod);
            case "UPDATE" -> "PUT".equalsIgnoreCase(httpMethod) || "PATCH".equalsIgnoreCase(httpMethod);
            case "DELETE" -> "DELETE".equalsIgnoreCase(httpMethod);
            case "*", "ALL" -> true; // 匹配所有方法
            default -> false;
        };
    }
    
    /**
     * 清除用户权限缓存
     */
    public void clearUserPermissionCache(Long userId) {
        // 这里可以使用Spring Cache的注解或手动清除缓存
        log.info("清除用户 {} 的权限缓存", userId);
    }
    
    /**
     * 清除路径权限缓存
     */
    public void clearPathPermissionCache() {
        // 清除所有路径权限缓存
        log.info("清除所有路径权限缓存");
    }
}
