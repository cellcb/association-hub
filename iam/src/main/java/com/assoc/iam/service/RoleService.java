package com.assoc.iam.service;

import com.assoc.common.exception.BusinessException;
import com.assoc.common.exception.ResourceNotFoundException;
import com.assoc.iam.dto.RoleRequest;
import com.assoc.iam.dto.RoleResponse;
import com.assoc.iam.entity.Role;
import com.assoc.iam.entity.Permission;
import com.assoc.iam.repository.RoleRepository;
import com.assoc.iam.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.existsByCode(request.getCode())) {
            throw new BusinessException(409, "角色编码已存在");
        }
        
        Role role = new Role();
        role.setName(request.getName());
        role.setCode(request.getCode());
        role.setDescription(request.getDescription());
        role.setStatus(request.getStatus());
        
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = permissionRepository.findAllById(request.getPermissionIds())
                .stream().collect(Collectors.toSet());
            role.setPermissions(permissions);
        }
        
        Role savedRole = roleRepository.save(role);
        return convertToResponse(savedRole);
    }
    
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("角色", id));
        return convertToResponse(role);
    }
    
    @Transactional(readOnly = true)
    public Page<RoleResponse> getAllRoles(Pageable pageable) {
        return roleRepository.findAll(pageable)
            .map(this::convertToResponse);
    }
    
    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("角色", id));
        
        if (!role.getCode().equals(request.getCode()) && roleRepository.existsByCode(request.getCode())) {
            throw new BusinessException(409, "角色编码已存在");
        }
        
        role.setName(request.getName());
        role.setCode(request.getCode());
        role.setDescription(request.getDescription());
        role.setStatus(request.getStatus());
        
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = permissionRepository.findAllById(request.getPermissionIds())
                .stream().collect(Collectors.toSet());
            role.setPermissions(permissions);
        }
        
        Role updatedRole = roleRepository.save(role);
        return convertToResponse(updatedRole);
    }
    
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("角色", id));
        roleRepository.delete(role);
    }
    
    private RoleResponse convertToResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setCode(role.getCode());
        response.setDescription(role.getDescription());
        response.setStatus(role.getStatus());
        response.setCreatedTime(role.getCreatedTime());
        response.setUpdatedTime(role.getUpdatedTime());
        response.setCreatedBy(role.getCreatedBy());
        response.setUpdatedBy(role.getUpdatedBy());
        
        // Intentionally omit permissions in RoleResponse serialization
        
        return response;
    }
    
    public RoleResponse assignPermissionsToRole(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("角色", roleId));
        
        Set<Permission> permissions = permissionRepository.findAllById(permissionIds)
            .stream().collect(Collectors.toSet());
        
        if (permissions.size() != permissionIds.size()) {
            throw new BusinessException(400, "部分权限不存在");
        }
        
        role.setPermissions(permissions);
        Role updatedRole = roleRepository.save(role);
        return convertToResponse(updatedRole);
    }
    
    public RoleResponse addPermissionsToRole(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("角色", roleId));
        
        Set<Permission> newPermissions = permissionRepository.findAllById(permissionIds)
            .stream().collect(Collectors.toSet());
        
        if (newPermissions.size() != permissionIds.size()) {
            throw new BusinessException(400, "部分权限不存在");
        }
        
        if (role.getPermissions() == null) {
            role.setPermissions(new java.util.HashSet<>());
        }
        role.getPermissions().addAll(newPermissions);
        
        Role updatedRole = roleRepository.save(role);
        return convertToResponse(updatedRole);
    }
    
    public RoleResponse removePermissionsFromRole(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("角色", roleId));
        
        if (role.getPermissions() != null) {
            role.getPermissions().removeIf(permission -> permissionIds.contains(permission.getId()));
        }
        
        Role updatedRole = roleRepository.save(role);
        return convertToResponse(updatedRole);
    }
    
    @Transactional(readOnly = true)
    public Set<com.assoc.iam.dto.PermissionResponse> getRolePermissions(Long roleId) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("角色", roleId));
        
        if (role.getPermissions() == null) {
            return new java.util.HashSet<>();
        }
        
        return role.getPermissions().stream()
            .map(this::convertPermissionToResponse)
            .collect(Collectors.toSet());
    }
    
    private com.assoc.iam.dto.PermissionResponse convertPermissionToResponse(Permission permission) {
        com.assoc.iam.dto.PermissionResponse response = new com.assoc.iam.dto.PermissionResponse();
        response.setId(permission.getId());
        response.setName(permission.getName());
        response.setCode(permission.getCode());
        response.setResource(permission.getResource());
        response.setAction(permission.getAction());
        response.setDescription(permission.getDescription());
        response.setStatus(permission.getStatus());
        response.setCreatedTime(permission.getCreatedTime());
        response.setUpdatedTime(permission.getUpdatedTime());
        response.setCreatedBy(permission.getCreatedBy());
        response.setUpdatedBy(permission.getUpdatedBy());
        return response;
    }
}
