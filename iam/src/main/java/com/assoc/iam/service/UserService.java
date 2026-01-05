package com.assoc.iam.service;

import com.assoc.iam.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 用户管理服务接口
 */
public interface UserService {
    
    /**
     * 创建用户
     * @param request 用户创建请求
     * @return 用户响应信息
     */
    UserResponse createUser(UserRequest request);
    
    /**
     * 根据ID获取用户信息
     * @param id 用户ID
     * @return 用户响应信息
     */
    UserResponse getUserById(Long id);
    
    /**
     * 根据用户名获取用户信息
     * @param username 用户名
     * @return 用户响应信息
     */
    UserResponse getUserByUsername(String username);
    
    /**
     * 分页获取所有用户
     * @param pageable 分页参数
     * @return 用户分页信息
     */
    Page<UserResponse> getAllUsers(Pageable pageable);
    
    
    /**
     * 搜索用户
     * @param keyword 关键词(用户名、真实姓名、邮箱)
     * @param pageable 分页参数
     * @return 用户分页信息
     */
    Page<UserResponse> searchUsers(String keyword, Pageable pageable);
    
    /**
     * 更新用户信息
     * @param id 用户ID
     * @param request 用户更新请求
     * @return 更新后的用户信息
     */
    UserResponse updateUser(Long id, UserUpdateRequest request);
    
    /**
     * 修改用户密码
     * @param id 用户ID
     * @param request 修改密码请求
     */
    void changePassword(Long id, ChangePasswordRequest request);
    
    /**
     * 重置用户密码
     * @param id 用户ID
     * @param newPassword 新密码
     */
    void resetPassword(Long id, String newPassword);
    
    /**
     * 启用用户
     * @param id 用户ID
     */
    void enableUser(Long id);
    
    /**
     * 禁用用户
     * @param id 用户ID
     */
    void disableUser(Long id);
    
    /**
     * 删除用户
     * @param id 用户ID
     */
    void deleteUser(Long id);
    
    /**
     * 为用户分配角色
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     */
    void assignRoles(Long userId, java.util.Set<Long> roleIds);
    
    /**
     * 移除用户角色
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     */
    void removeRoles(Long userId, java.util.Set<Long> roleIds);
    
    /**
     * 检查用户名是否存在
     * @param username 用户名
     * @return 是否存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 检查邮箱是否存在
     * @param email 邮箱
     * @return 是否存在
     */
    boolean existsByEmail(String email);
    
    /**
     * 获取用户可访问的菜单树
     * @param userId 用户ID
     * @return 菜单树列表
     */
    List<MenuTreeResponse> getUserMenuTree(Long userId);
    
    /**
     * 获取用户权限列表
     * @param userId 用户ID
     * @return 权限代码列表
     */
    List<String> getUserPermissions(Long userId);
    
    /**
     * 获取正常用户数量
     * @return 正常用户数量
     */
    long countActiveUsers();
    
    /**
     * 获取禁用用户数量
     * @return 禁用用户数量
     */
    long countDisabledUsers();
    
    /**
     * 根据状态获取用户数量
     * @param status 用户状态
     * @return 用户数量
     */
    long countByStatus(Integer status);
}
