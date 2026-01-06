package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * News category entity (dictionary table)
 */
@Data
@Entity
@Table(name = "cms_news_category")
@EqualsAndHashCode(callSuper = true)
public class NewsCategory extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Category name
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * Category code (unique)
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
