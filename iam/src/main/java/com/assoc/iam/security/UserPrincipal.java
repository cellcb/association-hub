package com.assoc.iam.security;

import com.assoc.iam.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security UserDetails 实现类
 * 将业务User实体和Spring Security认证分离
 */
@Getter
@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {
    
    private final User user;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return List.of();
        }
        
        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> new SimpleGrantedAuthority(permission.getCode()))
                .collect(Collectors.toSet());
    }
    
    @Override
    public String getPassword() {
        return user.getPassword();
    }
    
    @Override
    public String getUsername() {
        return user.getUsername();
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return user.getStatus() != null && user.getStatus() == 1;
    }
    
    /**
     * 获取用户ID
     */
    public Long getId() {
        return user.getId();
    }
    
    /**
     * 获取真实姓名
     */
    public String getRealName() {
        return user.getRealName();
    }
    
    /**
     * 获取邮箱
     */
    public String getEmail() {
        return user.getEmail();
    }
    
    /**
     * 获取所有部门ID列表（从用户部门关系中获取）
     */
    public List<Long> getDepartmentIds() {
        return user.getDepartmentIds();
    }

    /**
     * 获取角色代码列表
     */
    public List<String> getRoleCodes() {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return List.of();
        }
        return user.getRoles().stream()
                .map(role -> role.getCode())
                .collect(Collectors.toList());
    }
    
    /**
     * 获取权限代码列表
     */
    public List<String> getPermissionCodes() {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return List.of();
        }
        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getCode())
                .distinct()
                .collect(Collectors.toList());
    }
    
    /**
     * 静态工厂方法创建UserPrincipal
     */
    public static UserPrincipal create(User user) {
        return new UserPrincipal(user);
    }
}
