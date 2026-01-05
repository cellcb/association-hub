package com.assoc.iam.service;

import com.assoc.iam.entity.Permission;
import com.assoc.iam.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionConfigService {
    
    private final PermissionRepository permissionRepository;
    
    /**
     * 添加权限配置
     */
    @Transactional
    @CacheEvict(value = "pathPermissions", allEntries = true)
    public Permission addPermissionConfig(String name, String code, String resource, String action, String description) {
        // 检查权限代码是否已存在
        if (permissionRepository.existsByCode(code)) {
            throw new IllegalArgumentException("权限代码已存在: " + code);
        }
        
        Permission permission = new Permission();
        permission.setName(name);
        permission.setCode(code);
        permission.setResource(resource);
        permission.setAction(action);
        permission.setDescription(description);
        permission.setStatus(1);
        permission.setCreatedTime(LocalDateTime.now());
        permission.setUpdatedTime(LocalDateTime.now());
        
        Permission saved = permissionRepository.save(permission);
        log.info("添加权限配置: {} -> {} {}", code, action, resource);
        
        return saved;
    }
    
    /**
     * 更新权限配置
     */
    @Transactional
    @CacheEvict(value = "pathPermissions", allEntries = true)
public Permission updatePermissionConfig(Long id, String name, String code, String resource, String action, String description) {
        Optional<Permission> permissionOpt = permissionRepository.findById(id);
        if (permissionOpt.isEmpty()) {
            throw new IllegalArgumentException("权限不存在: " + id);
        }
        
        Permission permission = permissionOpt.get();
        
        // 如果修改了code，检查新code是否已存在
        if (!permission.getCode().equals(code) && permissionRepository.existsByCode(code)) {
            throw new IllegalArgumentException("权限代码已存在: " + code);
        }
        
        permission.setName(name);
        permission.setCode(code);
        permission.setResource(resource);
        permission.setAction(action);
        permission.setDescription(description);
        permission.setUpdatedTime(LocalDateTime.now());
        
        Permission updated = permissionRepository.save(permission);
        log.info("更新权限配置: {} -> {} {}", code, action, resource);
        
        return updated;
    }
    
    /**
     * 删除权限配置
     */
    @Transactional
    @CacheEvict(value = "pathPermissions", allEntries = true)
    public void deletePermissionConfig(Long id) {
        Optional<Permission> permissionOpt = permissionRepository.findById(id);
        if (permissionOpt.isEmpty()) {
            throw new IllegalArgumentException("权限不存在: " + id);
        }
        
        Permission permission = permissionOpt.get();
        permissionRepository.deleteById(id);
        log.info("删除权限配置: {}", permission.getCode());
    }
    
    /**
     * 启用/禁用权限配置
     */
    @Transactional
    @CacheEvict(value = {"pathPermissions", "userPermissions"}, allEntries = true)
    public void togglePermissionStatus(Long id, Integer status) {
        Optional<Permission> permissionOpt = permissionRepository.findById(id);
        if (permissionOpt.isEmpty()) {
            throw new IllegalArgumentException("权限不存在: " + id);
        }
        
        Permission permission = permissionOpt.get();
        permission.setStatus(status);
        permission.setUpdatedTime(LocalDateTime.now());
        
        permissionRepository.save(permission);
        log.info("修改权限状态: {} -> {}", permission.getCode(), status == 1 ? "启用" : "禁用");
    }
    
    /**
     * 批量添加API权限配置
     */
    @Transactional
    @CacheEvict(value = "pathPermissions", allEntries = true)
    public void batchAddApiPermissions(List<ApiPermissionConfig> configs) {
        for (ApiPermissionConfig config : configs) {
            try {
                if (!permissionRepository.existsByCode(config.getCode())) {
                    addPermissionConfig(
                        config.getName(),
                        config.getCode(), 
                        config.getResource(),
                        config.getAction(),
                        config.getDescription()
                    );
                }
            } catch (Exception e) {
                log.error("添加API权限配置失败: {}", config.getCode(), e);
            }
        }
    }
    
    /**
     * 获取所有权限配置
     */
    public List<Permission> getAllPermissionConfigs() {
        return permissionRepository.findAll();
    }
    
    /**
     * 根据资源路径查找权限配置
     */
    public List<Permission> getPermissionsByResource(String resourcePattern) {
        return permissionRepository.findByResourceContaining(resourcePattern);
    }
    
    /**
     * 清除所有权限缓存
     */
    @CacheEvict(value = {"pathPermissions", "userPermissions"}, allEntries = true)
    public void clearAllPermissionCache() {
        log.info("清除所有权限缓存");
    }
    
    /**
     * API权限配置类
     */
    public static class ApiPermissionConfig {
        private String name;
        private String code;
        private String resource;
        private String action;
        private String description;
        
        public ApiPermissionConfig() {}
        
        public ApiPermissionConfig(String name, String code, String resource, String action, String description) {
            this.name = name;
            this.code = code;
            this.resource = resource;
            this.action = action;
            this.description = description;
        }
        
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
