package com.assoc.iam.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "iam_user_department")
@EqualsAndHashCode(exclude = {"user", "department"}, callSuper = true)
@ToString(exclude = {"user", "department"}, callSuper = true)
public class UserDepartment extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "department_id", nullable = false)
    private Long departmentId;
    
    @Column(name = "position", length = 100)
    private String position;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;
    
    @Column(name = "status")
    private Integer status = 1; // 1:active, 0:inactive, 2:pending
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (this.startDate == null) {
            this.startDate = LocalDate.now();
        }
    }

    /**
     * Check if the relationship is currently active
     */
    public boolean isActive() {
        if (status != 1) {
            return false;
        }
        
        LocalDate now = LocalDate.now();
        
        // Check start date
        if (startDate != null && now.isBefore(startDate)) {
            return false;
        }
        
        // Check end date
        if (endDate != null && now.isAfter(endDate)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if the relationship is expired
     */
    public boolean isExpired() {
        LocalDate now = LocalDate.now();
        return endDate != null && now.isAfter(endDate);
    }
    
    /**
     * Check if the relationship is future
     */
    public boolean isFuture() {
        LocalDate now = LocalDate.now();
        return startDate != null && now.isBefore(startDate);
    }
    
    /**
     * Get department name
     */
    public String getDepartmentName() {
        return department != null ? department.getName() : null;
    }
    
    /**
     * Get department code
     */
    public String getDepartmentCode() {
        return department != null ? department.getCode() : null;
    }
    
    /**
     * Get user name
     */
    public String getUserName() {
        return user != null ? user.getUsername() : null;
    }
    
    /**
     * Get user real name
     */
    public String getUserRealName() {
        return user != null ? user.getRealName() : null;
    }
}
