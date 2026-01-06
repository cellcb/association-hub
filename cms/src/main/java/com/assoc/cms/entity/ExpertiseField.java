package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Expertise field entity (dictionary table)
 */
@Data
@Entity
@Table(name = "cms_expertise_field")
@EqualsAndHashCode(callSuper = true)
public class ExpertiseField extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Field name
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * Field code (unique)
     */
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    /**
     * Sort order
     */
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    /**
     * Status: 1-active, 0-inactive
     */
    @Column(name = "status")
    private Integer status = 1;

    /**
     * Description
     */
    @Column(name = "description", length = 200)
    private String description;
}
