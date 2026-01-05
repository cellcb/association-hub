package com.assoc.iam.service;

import com.assoc.iam.dto.*;
import com.assoc.iam.entity.Department;
import com.assoc.iam.entity.UserDepartment;
import com.assoc.iam.exception.UserNotFoundException;
import com.assoc.iam.repository.DepartmentRepository;
import com.assoc.iam.repository.UserDepartmentRepository;
import com.assoc.iam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserDepartmentServiceImpl implements UserDepartmentService {
    
    private final UserDepartmentRepository userDepartmentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    
    @Override
    public UserDepartmentResponse createUserDepartment(UserDepartmentRequest request) {
        log.info("Creating user-department relationship: userId={}, departmentId={}", 
                request.getUserId(), request.getDepartmentId());
        
        // Validate user and department exist
        validateUserExists(request.getUserId());
        validateDepartmentExists(request.getDepartmentId());
        
        // Check if relationship already exists
        if (userDepartmentRepository.existsActiveRelationship(
                request.getUserId(), request.getDepartmentId(), LocalDate.now())) {
            throw new IllegalArgumentException("用户与部门的关系已存在");
        }
        
        UserDepartment userDepartment = new UserDepartment();
        userDepartment.setUserId(request.getUserId());
        userDepartment.setDepartmentId(request.getDepartmentId());
        userDepartment.setPosition(request.getPosition());
        userDepartment.setIsPrimary(request.getIsPrimary());
        userDepartment.setStatus(request.getStatus());
        userDepartment.setStartDate(request.getStartDate());
        userDepartment.setEndDate(request.getEndDate());
        
        // If this is set as primary, clear other primary flags
        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            userDepartmentRepository.clearUserPrimaryFlag(request.getUserId());
        }
        
        userDepartment = userDepartmentRepository.save(userDepartment);
        return convertToResponse(userDepartment);
    }
    
    @Override
    public UserDepartmentResponse updateUserDepartment(Long id, UserDepartmentUpdateRequest request) {
        log.info("Updating user-department relationship: id={}", id);
        
        UserDepartment userDepartment = userDepartmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户部门关系不存在"));
        
        if (request.getPosition() != null) {
            userDepartment.setPosition(request.getPosition());
        }
        if (request.getIsPrimary() != null) {
            if (Boolean.TRUE.equals(request.getIsPrimary())) {
                userDepartmentRepository.clearUserPrimaryFlag(userDepartment.getUserId());
            }
            userDepartment.setIsPrimary(request.getIsPrimary());
        }
        if (request.getStatus() != null) {
            userDepartment.setStatus(request.getStatus());
        }
        if (request.getStartDate() != null) {
            userDepartment.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            userDepartment.setEndDate(request.getEndDate());
        }
        
        userDepartment = userDepartmentRepository.save(userDepartment);
        return convertToResponse(userDepartment);
    }
    
    @Override
    public void deleteUserDepartment(Long id) {
        log.info("Deleting user-department relationship: id={}", id);
        
        UserDepartment userDepartment = userDepartmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户部门关系不存在"));
        
        userDepartmentRepository.delete(userDepartment);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserDepartmentResponse getUserDepartment(Long id) {
        UserDepartment userDepartment = userDepartmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户部门关系不存在"));
        
        return convertToResponse(userDepartment);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserDepartmentResponse> getUserDepartmentsByUserId(Long userId) {
        List<UserDepartment> relationships = userDepartmentRepository.findByUserId(userId);
        return relationships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserDepartmentResponse> getUserDepartmentsByDepartmentId(Long departmentId) {
        List<UserDepartment> relationships = userDepartmentRepository.findByDepartmentId(departmentId);
        return relationships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserDepartmentResponse> getActiveUserDepartmentsByUserId(Long userId) {
        List<UserDepartment> relationships = userDepartmentRepository.findActiveByUserId(userId, LocalDate.now());
        return relationships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserDepartmentResponse> getActiveUserDepartmentsByDepartmentId(Long departmentId) {
        List<UserDepartment> relationships = userDepartmentRepository.findActiveByDepartmentId(departmentId, LocalDate.now());
        return relationships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserDepartmentResponse getUserPrimaryDepartment(Long userId) {
        return userDepartmentRepository.findPrimaryByUserId(userId, LocalDate.now())
                .map(this::convertToResponse)
                .orElse(null);
    }
    
    @Override
    public UserDepartmentResponse setUserPrimaryDepartment(Long userId, Long departmentId) {
        log.info("Setting primary department for user: userId={}, departmentId={}", userId, departmentId);
        
        // Validate user and department exist
        validateUserExists(userId);
        validateDepartmentExists(departmentId);
        
        // Check if user-department relationship exists and is active
        if (!userDepartmentRepository.existsActiveRelationship(userId, departmentId, LocalDate.now())) {
            throw new IllegalArgumentException("用户与部门的关系不存在或未激活");
        }
        
        // Clear existing primary flag
        userDepartmentRepository.clearUserPrimaryFlag(userId);
        
        // Set new primary department
        int updated = userDepartmentRepository.setUserPrimaryDepartment(userId, departmentId);
        if (updated == 0) {
            throw new IllegalArgumentException("设置主要部门失败");
        }
        
        return getUserPrimaryDepartment(userId);
    }
    
    @Override
    public UserDepartmentResponse addUserToDepartment(Long userId, Long departmentId, String position, Boolean isPrimary) {
        UserDepartmentRequest request = new UserDepartmentRequest();
        request.setUserId(userId);
        request.setDepartmentId(departmentId);
        request.setPosition(position);
        request.setIsPrimary(isPrimary);
        request.setStartDate(LocalDate.now());
        
        return createUserDepartment(request);
    }
    
    @Override
    public void removeUserFromDepartment(Long userId, Long departmentId) {
        log.info("Removing user from department: userId={}, departmentId={}", userId, departmentId);
        
        int updated = userDepartmentRepository.deactivateRelationship(userId, departmentId, LocalDate.now(), null);
        if (updated == 0) {
            throw new IllegalArgumentException("用户部门关系不存在或已失效");
        }
    }
    
    @Override
    public UserDepartmentResponse transferUserToDepartment(Long userId, Long fromDepartmentId, Long toDepartmentId, String position) {
        log.info("Transferring user: userId={}, from={}, to={}", userId, fromDepartmentId, toDepartmentId);
        
        // Validate departments exist
        validateDepartmentExists(fromDepartmentId);
        validateDepartmentExists(toDepartmentId);
        
        // Check if user is in source department
        if (!userDepartmentRepository.existsActiveRelationship(userId, fromDepartmentId, LocalDate.now())) {
            throw new IllegalArgumentException("用户不在源部门中");
        }
        
        // Check if target relationship already exists
        if (userDepartmentRepository.existsActiveRelationship(userId, toDepartmentId, LocalDate.now())) {
            throw new IllegalArgumentException("用户已在目标部门中");
        }
        
        // Deactivate old relationship
        removeUserFromDepartment(userId, fromDepartmentId);
        
        // Create new relationship (preserve primary flag if it was primary)
        UserDepartment oldRelation = userDepartmentRepository.findByUserIdAndDepartmentIdAndStatus(
                userId, fromDepartmentId, 0).orElse(null);
        
        boolean wasPrimary = oldRelation != null && Boolean.TRUE.equals(oldRelation.getIsPrimary());
        
        return addUserToDepartment(userId, toDepartmentId, position, wasPrimary);
    }
    
    @Override
    public List<UserDepartmentResponse> batchCreateUserDepartments(BatchUserDepartmentRequest request) {
        log.info("Batch creating user-department relationships: count={}", request.getRelationships().size());
        
        return request.getRelationships().stream()
                .map(this::createUserDepartment)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserDepartmentResponse> getUsersByPositionInDepartment(Long departmentId, String position) {
        List<UserDepartment> relationships = userDepartmentRepository.findByDepartmentIdAndPosition(
                departmentId, position, LocalDate.now());
        
        return relationships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getDepartmentUserCount(Long departmentId) {
        return userDepartmentRepository.countActiveUsersByDepartmentId(departmentId, LocalDate.now());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isUserInDepartment(Long userId, Long departmentId) {
        return userDepartmentRepository.existsActiveRelationship(userId, departmentId, LocalDate.now());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Long> getUserIdsInDepartmentTree(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("部门不存在"));
        
        String pathPrefix = department.getPath() + "/%";
        
        return userDepartmentRepository.findUserIdsByDepartmentPath(departmentId, pathPrefix, LocalDate.now());
    }
    
    @Override
    public int processExpiredRelationships() {
        log.info("Processing expired user-department relationships");
        
        List<UserDepartment> expiredRelationships = userDepartmentRepository.findExpiredRelationships(LocalDate.now());
        
        for (UserDepartment relationship : expiredRelationships) {
            relationship.setStatus(0); // Set to inactive
        }
        
        userDepartmentRepository.saveAll(expiredRelationships);
        
        log.info("Processed {} expired relationships", expiredRelationships.size());
        return expiredRelationships.size();
    }
    
    private UserDepartmentResponse convertToResponse(UserDepartment userDepartment) {
        UserDepartmentResponse response = new UserDepartmentResponse();
        response.setId(userDepartment.getId());
        response.setUserId(userDepartment.getUserId());
        response.setDepartmentId(userDepartment.getDepartmentId());
        response.setPosition(userDepartment.getPosition());
        response.setIsPrimary(userDepartment.getIsPrimary());
        response.setStatus(userDepartment.getStatus());
        response.setStartDate(userDepartment.getStartDate());
        response.setEndDate(userDepartment.getEndDate());
        response.setCreatedTime(userDepartment.getCreatedTime());
        response.setUpdatedTime(userDepartment.getUpdatedTime());
        
        // Set computed fields
        response.setActive(userDepartment.isActive());
        response.setExpired(userDepartment.isExpired());
        response.setFuture(userDepartment.isFuture());
        
        // Set related entity fields if available
        if (userDepartment.getUser() != null) {
            response.setUsername(userDepartment.getUser().getUsername());
            response.setUserRealName(userDepartment.getUser().getRealName());
        }
        
        if (userDepartment.getDepartment() != null) {
            response.setDepartmentName(userDepartment.getDepartment().getName());
            response.setDepartmentCode(userDepartment.getDepartment().getCode());
        }
        
        return response;
    }
    
    private void validateUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("用户不存在: " + userId);
        }
    }
    
    private void validateDepartmentExists(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new IllegalArgumentException("部门不存在: " + departmentId);
        }
    }
}
