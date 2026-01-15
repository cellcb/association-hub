package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Project category entity for dynamic category management
 */
@Entity
@Table(name = "cms_project_category")
@Getter
@Setter
public class ProjectCategoryEntity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Category name
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * Category code (unique identifier)
     */
    @Column(unique = true, length = 50)
    private String code;

    /**
     * Sort order
     */
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    /**
     * Status: 1-enabled, 0-disabled
     */
    private Integer status = 1;

    /**
     * Description
     */
    private String description;
}
