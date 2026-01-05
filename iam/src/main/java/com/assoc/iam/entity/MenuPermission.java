package com.assoc.iam.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "iam_menu_permission")
@EqualsAndHashCode
@ToString
public class MenuPermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "menu_id", nullable = false)
    private Long menuId;
    
    @Column(name = "permission_id", nullable = false)
    private Long permissionId;
    
    @Column(name = "created_time")
    private LocalDateTime createdTime;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @PrePersist
    protected void onCreate() {
        this.createdTime = LocalDateTime.now();
    }
}
