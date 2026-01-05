package com.assoc.iam.service;

import com.assoc.iam.dto.PermissionRequest;
import com.assoc.iam.dto.PermissionResponse;
import com.assoc.iam.entity.Permission;
import com.assoc.iam.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {
    
    private final PermissionRepository permissionRepository;
    
    public PermissionResponse createPermission(PermissionRequest request) {
        if (permissionRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Permission code already exists: " + request.getCode());
        }
        
        Permission permission = new Permission();
        permission.setName(request.getName());
        permission.setCode(request.getCode());
        permission.setResource(request.getResource());
        permission.setAction(request.getAction());
        permission.setDescription(request.getDescription());
        permission.setStatus(request.getStatus());
        
        Permission savedPermission = permissionRepository.save(permission);
        return convertToResponse(savedPermission);
    }
    
    @Transactional(readOnly = true)
    public PermissionResponse getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
        return convertToResponse(permission);
    }
    
    @Transactional(readOnly = true)
    public Page<PermissionResponse> getAllPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable)
            .map(this::convertToResponse);
    }
    
    public PermissionResponse updatePermission(Long id, PermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
        
        if (!permission.getCode().equals(request.getCode()) && permissionRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Permission code already exists: " + request.getCode());
        }
        
        permission.setName(request.getName());
        permission.setCode(request.getCode());
        permission.setResource(request.getResource());
        permission.setAction(request.getAction());
        permission.setDescription(request.getDescription());
        permission.setStatus(request.getStatus());
        
        Permission updatedPermission = permissionRepository.save(permission);
        return convertToResponse(updatedPermission);
    }
    
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
        permissionRepository.delete(permission);
    }
    
    private PermissionResponse convertToResponse(Permission permission) {
        PermissionResponse response = new PermissionResponse();
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
