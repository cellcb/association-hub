package com.assoc.iam.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "iam_department")
@EqualsAndHashCode(exclude = {"parent", "children", "userDepartments"}, callSuper = true)
@ToString(exclude = {"parent", "children", "userDepartments"}, callSuper = true)
public class Department extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "parent_id")
    private Long parentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Department parent;
    
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Department> children;
    
    
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<UserDepartment> userDepartments;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @Column(name = "level")
    private Integer level = 1;
    
    @Column(name = "path", length = 500)
    private String path;
    
    @Column(name = "status")
    private Integer status = 1; // 1:active, 0:inactive

    public boolean isRoot() {
        return parentId == null;
    }
    
    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }
    
    public boolean hasUsers() {
        return hasActiveUsers();
    }
    
    /**
     * Get all active user-department relationships
     */
    public List<UserDepartment> getActiveUserDepartments() {
        if (userDepartments == null || userDepartments.isEmpty()) {
            return List.of();
        }
        
        return userDepartments.stream()
                .filter(UserDepartment::isActive)
                .collect(Collectors.toList());
    }
    
    /**
     * Get active user count from user-department relationships
     */
    public long getActiveUserCount() {
        return userDepartments != null ? userDepartments.stream()
                .filter(UserDepartment::isActive)
                .map(UserDepartment::getUserId)
                .distinct()
                .count() : 0;
    }
    
    /**
     * Check if department has active users (including from relationships)
     */
    public boolean hasActiveUsers() {
        return getActiveUserCount() > 0;
    }
    
    /**
     * Get users by position in this department
     */
    public List<UserDepartment> getUsersByPosition(String position) {
        if (userDepartments == null || userDepartments.isEmpty()) {
            return List.of();
        }
        
        return userDepartments.stream()
                .filter(ud -> ud.isActive() && position.equals(ud.getPosition()))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all positions available in this department
     */
    public List<String> getAvailablePositions() {
        if (userDepartments == null || userDepartments.isEmpty()) {
            return List.of();
        }
        
        return userDepartments.stream()
                .filter(UserDepartment::isActive)
                .map(UserDepartment::getPosition)
                .filter(position -> position != null && !position.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }
}
