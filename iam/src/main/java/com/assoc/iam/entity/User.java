package com.assoc.iam.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "iam_user")
@EqualsAndHashCode(exclude = {"roles", "userDepartments"}, callSuper = true)
@ToString(exclude = {"roles", "userDepartments"}, callSuper = true)
public class User extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(name = "password", nullable = false, length = 100)
    private String password;
    
    @Column(name = "email", unique = true, length = 100)
    private String email;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "real_name", length = 50)
    private String realName;
    
    @Column(name = "status")
    private Integer status = 1; // 1:active, 0:inactive
    
    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "iam_user_role",
        joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id")
    )
    private Set<Role> roles;
    
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<UserDepartment> userDepartments;

    /**
     * Get user role codes
     */
    public List<String> getRoleCodes() {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream()
                .map(Role::getCode)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user permission codes
     */
    public List<String> getPermissionCodes() {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getCode)
                .distinct()
                .collect(Collectors.toList());
    }
    
    /**
     * Get department name (returns primary department name)
     */
    public String getDepartmentName() {
        return getPrimaryDepartmentName();
    }
    
    /**
     * Get primary department name from user-department relationships
     */
    public String getPrimaryDepartmentName() {
        if (userDepartments == null || userDepartments.isEmpty()) {
            return null;
        }
        
        LocalDate now = LocalDate.now();
        return userDepartments.stream()
                .filter(ud -> Boolean.TRUE.equals(ud.getIsPrimary()) && ud.isActive())
                .findFirst()
                .map(UserDepartment::getDepartmentName)
                .orElse(null);
    }
    
    /**
     * Get all active departments for this user
     */
    public List<UserDepartment> getActiveDepartments() {
        if (userDepartments == null || userDepartments.isEmpty()) {
            return List.of();
        }
        
        return userDepartments.stream()
                .filter(UserDepartment::isActive)
                .collect(Collectors.toList());
    }
    
    /**
     * Get primary department relationship
     */
    public UserDepartment getPrimaryDepartment() {
        if (userDepartments == null || userDepartments.isEmpty()) {
            return null;
        }
        
        return userDepartments.stream()
                .filter(ud -> Boolean.TRUE.equals(ud.getIsPrimary()) && ud.isActive())
                .findFirst()
                .orElse(null);
    }
    
    /**
     * Check if user belongs to department through user-department relationships
     */
    public boolean belongsToDepartment(Long departmentId) {
        if (departmentId == null || userDepartments == null || userDepartments.isEmpty()) {
            return false;
        }
        
        return userDepartments.stream()
                .anyMatch(ud -> departmentId.equals(ud.getDepartmentId()) && ud.isActive());
    }
    
    /**
     * Get all department IDs for this user
     */
    public List<Long> getDepartmentIds() {
        if (userDepartments == null || userDepartments.isEmpty()) {
            return List.of();
        }
        
        return userDepartments.stream()
                .filter(UserDepartment::isActive)
                .map(UserDepartment::getDepartmentId)
                .collect(Collectors.toList());
    }
}
