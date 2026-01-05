package com.assoc.iam.service;

import com.assoc.iam.dto.*;

import java.util.List;

public interface UserDepartmentService {
    
    /**
     * Create user-department relationship
     */
    UserDepartmentResponse createUserDepartment(UserDepartmentRequest request);
    
    /**
     * Update user-department relationship
     */
    UserDepartmentResponse updateUserDepartment(Long id, UserDepartmentUpdateRequest request);
    
    /**
     * Delete user-department relationship
     */
    void deleteUserDepartment(Long id);
    
    /**
     * Get user-department relationship by ID
     */
    UserDepartmentResponse getUserDepartment(Long id);
    
    /**
     * Get all user-department relationships by user ID
     */
    List<UserDepartmentResponse> getUserDepartmentsByUserId(Long userId);
    
    /**
     * Get all user-department relationships by department ID
     */
    List<UserDepartmentResponse> getUserDepartmentsByDepartmentId(Long departmentId);
    
    /**
     * Get active user-department relationships by user ID
     */
    List<UserDepartmentResponse> getActiveUserDepartmentsByUserId(Long userId);
    
    /**
     * Get active user-department relationships by department ID
     */
    List<UserDepartmentResponse> getActiveUserDepartmentsByDepartmentId(Long departmentId);
    
    /**
     * Get user's primary department
     */
    UserDepartmentResponse getUserPrimaryDepartment(Long userId);
    
    /**
     * Set user's primary department
     */
    UserDepartmentResponse setUserPrimaryDepartment(Long userId, Long departmentId);
    
    /**
     * Add user to department
     */
    UserDepartmentResponse addUserToDepartment(Long userId, Long departmentId, String position, Boolean isPrimary);
    
    /**
     * Remove user from department
     */
    void removeUserFromDepartment(Long userId, Long departmentId);
    
    /**
     * Transfer user to another department (deactivate old, create new)
     */
    UserDepartmentResponse transferUserToDepartment(Long userId, Long fromDepartmentId, Long toDepartmentId, String position);
    
    /**
     * Batch create user-department relationships
     */
    List<UserDepartmentResponse> batchCreateUserDepartments(BatchUserDepartmentRequest request);
    
    /**
     * Get users by position in department
     */
    List<UserDepartmentResponse> getUsersByPositionInDepartment(Long departmentId, String position);
    
    /**
     * Get department user count
     */
    long getDepartmentUserCount(Long departmentId);
    
    /**
     * Check if user belongs to department
     */
    boolean isUserInDepartment(Long userId, Long departmentId);
    
    /**
     * Get all user IDs in department (including sub-departments)
     */
    List<Long> getUserIdsInDepartmentTree(Long departmentId);
    
    /**
     * Process expired relationships (batch update status)
     */
    int processExpiredRelationships();
}
