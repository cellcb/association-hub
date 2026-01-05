package com.assoc.iam.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Set;

@Data
@Entity
@Table(name = "iam_permission")
@EqualsAndHashCode(exclude = {"roles"}, callSuper = true)
@ToString(exclude = {"roles"}, callSuper = true)
public class Permission extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 50)
    private String name;
    
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;
    
    @Column(name = "resource", length = 100)
    private String resource;
    
    @Column(name = "action", length = 50)
    private String action;
    
    @Column(name = "description", length = 200)
    private String description;
    
    @Column(name = "status")
    private Integer status = 1; // 1:active, 0:inactive

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    private Set<Role> roles;
}
