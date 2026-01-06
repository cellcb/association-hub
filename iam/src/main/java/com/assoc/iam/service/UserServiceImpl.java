package com.assoc.iam.service;

import com.assoc.common.context.RequestContext;
import com.assoc.iam.dto.*;
import com.assoc.iam.entity.Menu;
import com.assoc.iam.entity.Role;
import com.assoc.iam.entity.User;
import com.assoc.iam.exception.InvalidPasswordException;
import com.assoc.iam.exception.UserAlreadyExistsException;
import com.assoc.iam.exception.UserNotFoundException;
import com.assoc.iam.repository.MenuRepository;
import com.assoc.iam.repository.RoleRepository;
import com.assoc.iam.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MenuRepository menuRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDepartmentService userDepartmentService;
    private final RequestContext requestContext;
    private final GlobalUserLookupService globalUserLookupService;
    
    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        log.info("Creating user with username: {}", request.getUsername());
        
        // 检查用户名是否已存在
        if (globalUserLookupService.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("用户名", request.getUsername());
        }
        
        // 检查邮箱是否已存在
        if (StringUtils.hasText(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("邮箱", request.getEmail());
        }
        
        // 创建用户实体
        User user = new User();
        user.setUsername(request.getUsername());
        // 判断密码是否已加密，避免二次加密
        if (request.isPasswordEncrypted()) {
            user.setPassword(request.getPassword());
        } else {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRealName(request.getRealName());
        user.setStatus(request.getStatus());
        
        // 分配角色
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
            user.setRoles(roles);
        }
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        return convertToResponse(savedUser);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return convertToResponse(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("用户不存在: " + username));
        return convertToResponse(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToResponse);
    }
    
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchByKeyword(keyword, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        log.info("Updating user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        
        // 检查邮箱是否与其他用户冲突
        if (StringUtils.hasText(request.getEmail()) && 
            !Objects.equals(user.getEmail(), request.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("邮箱", request.getEmail());
        }
        
        // 更新用户信息
        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getRealName())) {
            user.setRealName(request.getRealName());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        
        // 更新角色
        if (request.getRoleIds() != null) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
            user.setRoles(roles);
        }
        
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with ID: {}", updatedUser.getId());
        
        return convertToResponse(updatedUser);
    }
    
    @Override
    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        log.info("Changing password for user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        
        // 验证旧密码
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidPasswordException("旧密码不正确");
        }
        
        // 验证新密码确认
        if (!Objects.equals(request.getNewPassword(), request.getConfirmPassword())) {
            throw new InvalidPasswordException("新密码与确认密码不一致");
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user ID: {}", id);
    }
    
    @Override
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        log.info("Resetting password for user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Password reset successfully for user ID: {}", id);
    }
    
    @Override
    @Transactional
    public void enableUser(Long id) {
        log.info("Enabling user ID: {}", id);
        updateUserStatus(id, 1);
    }
    
    @Override
    @Transactional
    public void disableUser(Long id) {
        log.info("Disabling user ID: {}", id);
        updateUserStatus(id, 0);
    }
    
    private void updateUserStatus(Long id, Integer status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        user.setStatus(status);
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user ID: {}", id);
        
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        
        userRepository.deleteById(id);
        log.info("User deleted successfully with ID: {}", id);
    }
    
    @Override
    @Transactional
    public void assignRoles(Long userId, Set<Long> roleIds) {
        log.info("Assigning roles {} to user ID: {}", roleIds, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        
        Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }
        user.getRoles().addAll(roles);
        
        userRepository.save(user);
        log.info("Roles assigned successfully to user ID: {}", userId);
    }
    
    @Override
    @Transactional
    public void removeRoles(Long userId, Set<Long> roleIds) {
        log.info("Removing roles {} from user ID: {}", roleIds, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        
        if (user.getRoles() != null) {
            user.getRoles().removeIf(role -> roleIds.contains(role.getId()));
            userRepository.save(user);
        }
        
        log.info("Roles removed successfully from user ID: {}", userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MenuTreeResponse> getUserMenuTree(Long userId) {
        log.debug("Getting menu tree for user: {}", userId);

        List<Menu> userMenus = menuRepository.findAccessibleMenusByUserId(userId);
        return buildMenuTree(userMenus);
    }
    
    @Override
    @Transactional(readOnly = true) 
    public List<String> getUserPermissions(Long userId) {
        log.debug("Getting permissions for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户不存在，ID: " + userId));
        
        return user.getPermissionCodes();
    }
    
    /**
     * 转换User实体为UserResponse
     */
    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRealName(user.getRealName());
        response.setStatus(user.getStatus());
        response.setLastLoginTime(user.getLastLoginTime());
        response.setCreatedTime(user.getCreatedTime());
        response.setUpdatedTime(user.getUpdatedTime());
        response.setCreatedBy(user.getCreatedBy());
        response.setUpdatedBy(user.getUpdatedBy());
        response.setDepartmentName(user.getDepartmentName());
        
        // 转换角色信息
        if (user.getRoles() != null) {
            Set<RoleResponse> roleResponses = user.getRoles().stream()
                    .map(this::convertRoleToResponse)
                    .collect(Collectors.toSet());
            response.setRoles(roleResponses);
            response.setRoleCodes(user.getRoleCodes());
        }
        
        // 设置权限代码
        response.setPermissionCodes(user.getPermissionCodes());
        
        // 设置用户部门关系信息
        try {
            response.setDepartments(userDepartmentService.getActiveUserDepartmentsByUserId(user.getId()));
            response.setPrimaryDepartment(userDepartmentService.getUserPrimaryDepartment(user.getId()));
        } catch (Exception e) {
            log.warn("Failed to load user department relationships for user {}: {}", user.getId(), e.getMessage());
        }
        
        return response;
    }
    
    /**
     * 转换Role实体为RoleResponse（简化版）
     */
    private RoleResponse convertRoleToResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setCode(role.getCode());
        response.setDescription(role.getDescription());
        response.setStatus(role.getStatus());
        response.setCreatedTime(role.getCreatedTime());
        response.setUpdatedTime(role.getUpdatedTime());
        return response;
    }
    
    /**
     * 构建菜单树结构
     */
    private List<MenuTreeResponse> buildMenuTree(List<Menu> menus) {
        Map<Long, MenuTreeResponse> menuMap = menus.stream()
                .map(this::convertToTreeResponse)
                .collect(Collectors.toMap(MenuTreeResponse::getId, menu -> menu));
        
        List<MenuTreeResponse> rootMenus = new ArrayList<>();
        
        for (MenuTreeResponse menu : menuMap.values()) {
            if (menu.getParentId() == null) {
                rootMenus.add(menu);
            } else {
                MenuTreeResponse parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(menu);
                }
            }
        }
        
        // Sort menus at each level
        sortMenuTree(rootMenus);
        return rootMenus;
    }
    
    /**
     * 排序菜单树
     */
    private void sortMenuTree(List<MenuTreeResponse> menus) {
        if (menus == null || menus.isEmpty()) {
            return;
        }
        
        menus.sort((a, b) -> {
            int result = Integer.compare(a.getSortOrder(), b.getSortOrder());
            return result != 0 ? result : Long.compare(a.getId(), b.getId());
        });
        
        menus.forEach(menu -> {
            if (menu.getChildren() != null) {
                menu.setHasChildren(true);
                sortMenuTree(menu.getChildren());
            }
        });
    }
    
    /**
     * 转换Menu实体为MenuTreeResponse
     */
    private MenuTreeResponse convertToTreeResponse(Menu menu) {
        MenuTreeResponse response = new MenuTreeResponse();
        response.setId(menu.getId());
        response.setName(menu.getName());
        response.setCode(menu.getCode());
        response.setPath(menu.getPath());
        response.setIcon(menu.getIcon());
        response.setComponent(menu.getComponent());
        response.setParentId(menu.getParentId());
        response.setLevel(menu.getLevel());
        response.setSortOrder(menu.getSortOrder());
        response.setMenuType(menu.getMenuType());
        response.setExternal(menu.getExternal());
        response.setCache(menu.getCache());
        response.setHidden(menu.getHidden());
        response.setHasChildren(menu.hasChildren());
        
        // Set meta information for frontend
        MenuTreeResponse.MenuMeta meta = new MenuTreeResponse.MenuMeta();
        meta.setTitle(menu.getName());
        meta.setIcon(menu.getIcon());
        meta.setHideInMenu(menu.getHidden());
        meta.setKeepAlive(menu.getCache());
        meta.setTarget(menu.getExternal() ? "_blank" : null);
        meta.setOrder(menu.getSortOrder());
        response.setMeta(meta);
        
        return response;
    }
    
    @Override
    public long countActiveUsers() {
        log.debug("Counting active users");
        return userRepository.countActiveUsers();
    }
    
    @Override
    public long countDisabledUsers() {
        log.debug("Counting disabled users");
        return userRepository.countDisabledUsers();
    }
    
    @Override
    public long countByStatus(Integer status) {
        log.debug("Counting users by status: {}", status);
        return userRepository.countByStatus(status);
    }
}
