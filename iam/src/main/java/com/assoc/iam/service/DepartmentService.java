package com.assoc.iam.service;

import com.assoc.iam.dto.DepartmentRequest;
import com.assoc.iam.dto.DepartmentResponse;
import com.assoc.iam.dto.DepartmentTreeResponse;
import com.assoc.iam.entity.Department;
import com.assoc.iam.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    
    @Transactional(readOnly = true)
    public List<DepartmentTreeResponse> getDepartmentTree() {
        List<Department> rootDepartments = departmentRepository.findActiveRootDepartments();
        return rootDepartments.stream()
                .map(this::convertToTreeResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        List<Department> departments = departmentRepository.findByStatusOrderBySortOrderAsc(1);
        return departments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<DepartmentResponse> getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(this::convertToResponse);
    }
    
    @Transactional(readOnly = true)
    public Optional<DepartmentResponse> getDepartmentByCode(String code) {
        return departmentRepository.findByCode(code)
                .map(this::convertToResponse);
    }
    
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getChildrenByParentId(Long parentId) {
        List<Department> children = departmentRepository.findActiveChildrenByParentId(parentId);
        return children.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DepartmentResponse> searchDepartments(String name) {
        List<Department> departments = departmentRepository.findByNameContainingIgnoreCaseAndStatusOrderBySortOrderAsc(name, 1);
        return departments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        validateDepartmentRequest(request);
        
        Department department = new Department();
        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setDescription(request.getDescription());
        department.setParentId(request.getParentId());
        department.setSortOrder(request.getSortOrder());
        department.setStatus(request.getStatus());
        
        calculateDepartmentPath(department);
        
        Department savedDepartment = departmentRepository.save(department);
        log.info("Created department: {} with code: {}", savedDepartment.getName(), savedDepartment.getCode());
        
        return convertToResponse(savedDepartment);
    }
    
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("部门不存在"));
        
        validateDepartmentRequest(request, id);
        
        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setDescription(request.getDescription());
        department.setSortOrder(request.getSortOrder());
        department.setStatus(request.getStatus());
        
        if (!java.util.Objects.equals(department.getParentId(), request.getParentId())) {
            department.setParentId(request.getParentId());
            calculateDepartmentPath(department);
            updateChildrenPaths(department);
        }
        
        Department savedDepartment = departmentRepository.save(department);
        log.info("Updated department: {} with code: {}", savedDepartment.getName(), savedDepartment.getCode());
        
        return convertToResponse(savedDepartment);
    }
    
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("部门不存在"));
        
        if (departmentRepository.hasChildren(id)) {
            throw new IllegalArgumentException("存在子部门，无法删除");
        }
        
        if (department.hasUsers()) {
            throw new IllegalArgumentException("部门下存在用户，无法删除");
        }
        
        departmentRepository.delete(department);
        log.info("Deleted department: {} with code: {}", department.getName(), department.getCode());
    }
    
    @Transactional
    public void moveDepartment(Long id, Long newParentId) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("部门不存在"));
        
        if (newParentId != null) {
            Department newParent = departmentRepository.findById(newParentId)
                    .orElseThrow(() -> new IllegalArgumentException("目标父部门不存在"));
            
            if (isDescendant(newParentId, id)) {
                throw new IllegalArgumentException("不能移动到自己的子部门");
            }
        }
        
        department.setParentId(newParentId);
        calculateDepartmentPath(department);
        updateChildrenPaths(department);
        
        departmentRepository.save(department);
        log.info("Moved department: {} to new parent: {}", department.getName(), newParentId);
    }
    
    private void validateDepartmentRequest(DepartmentRequest request) {
        validateDepartmentRequest(request, null);
    }
    
    private void validateDepartmentRequest(DepartmentRequest request, Long excludeId) {
        if (departmentRepository.existsByCode(request.getCode())) {
            Optional<Department> existing = departmentRepository.findByCode(request.getCode());
            if (existing.isPresent() && (excludeId == null || !existing.get().getId().equals(excludeId))) {
                throw new IllegalArgumentException("部门编码已存在");
            }
        }
        
        if (request.getParentId() != null) {
            if (!departmentRepository.existsById(request.getParentId())) {
                throw new IllegalArgumentException("父部门不存在");
            }
            
            if (excludeId != null && request.getParentId().equals(excludeId)) {
                throw new IllegalArgumentException("不能将部门设置为自己的父部门");
            }
        }
    }
    
    private void calculateDepartmentPath(Department department) {
        StringBuilder path = new StringBuilder();
        List<String> pathParts = new ArrayList<>();
        
        if (department.getParentId() != null) {
            Department parent = departmentRepository.findById(department.getParentId()).orElse(null);
            if (parent != null) {
                pathParts.add(parent.getPath());
                department.setLevel(parent.getLevel() + 1);
            }
        } else {
            department.setLevel(1);
        }
        
        pathParts.add(department.getId() != null ? department.getId().toString() : "0");
        department.setPath(String.join("/", pathParts));
    }
    
    private void updateChildrenPaths(Department parent) {
        List<Department> children = departmentRepository.findByParentIdOrderBySortOrderAsc(parent.getId());
        for (Department child : children) {
            calculateDepartmentPath(child);
            departmentRepository.save(child);
            updateChildrenPaths(child);
        }
    }
    
    private boolean isDescendant(Long potentialDescendant, Long ancestor) {
        Department dept = departmentRepository.findById(potentialDescendant).orElse(null);
        while (dept != null && dept.getParentId() != null) {
            if (dept.getParentId().equals(ancestor)) {
                return true;
            }
            dept = departmentRepository.findById(dept.getParentId()).orElse(null);
        }
        return false;
    }
    
    private DepartmentTreeResponse convertToTreeResponse(Department department) {
        DepartmentTreeResponse response = new DepartmentTreeResponse();
        response.setId(department.getId());
        response.setName(department.getName());
        response.setCode(department.getCode());
        response.setDescription(department.getDescription());
        response.setParentId(department.getParentId());
        response.setSortOrder(department.getSortOrder());
        response.setLevel(department.getLevel());
        response.setStatus(department.getStatus());
        response.setHasChildren(department.hasChildren());
        response.setUserCount((int) department.getActiveUserCount());
        
        if (department.hasChildren()) {
            List<DepartmentTreeResponse> children = department.getChildren().stream()
                    .filter(child -> child.getStatus() == 1)
                    .map(this::convertToTreeResponse)
                    .collect(Collectors.toList());
            response.setChildren(children);
        }
        
        return response;
    }
    
    private DepartmentResponse convertToResponse(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setId(department.getId());
        response.setName(department.getName());
        response.setCode(department.getCode());
        response.setDescription(department.getDescription());
        response.setParentId(department.getParentId());
        response.setSortOrder(department.getSortOrder());
        response.setLevel(department.getLevel());
        response.setPath(department.getPath());
        response.setStatus(department.getStatus());
        response.setCreatedTime(department.getCreatedTime());
        response.setUpdatedTime(department.getUpdatedTime());
        response.setCreatedBy(department.getCreatedBy());
        response.setUpdatedBy(department.getUpdatedBy());
        response.setHasChildren(department.hasChildren());
        response.setUserCount((int) department.getActiveUserCount());
        
        if (department.getParent() != null) {
            response.setParentName(department.getParent().getName());
        }
        
        return response;
    }
}
