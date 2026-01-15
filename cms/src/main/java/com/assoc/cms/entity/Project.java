package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * Project showcase entity
 */
@Data
@Entity
@Table(name = "cms_project")
@EqualsAndHashCode(callSuper = true)
public class Project extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Project title
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * Project category (legacy enum field, kept for backward compatibility)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 30)
    private ProjectCategory category;

    /**
     * Project category ID (new field for dynamic category management)
     */
    @Column(name = "category_id")
    private Long categoryId;

    /**
     * Project category entity (for fetching category details)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private ProjectCategoryEntity categoryEntity;

    /**
     * Location
     */
    @Column(name = "location", length = 200)
    private String location;

    /**
     * Completion date
     */
    @Column(name = "completion_date")
    private LocalDate completionDate;

    /**
     * Owner/Client
     */
    @Column(name = "owner", length = 200)
    private String owner;

    /**
     * Designer
     */
    @Column(name = "designer", length = 200)
    private String designer;

    /**
     * Contractor
     */
    @Column(name = "contractor", length = 200)
    private String contractor;

    /**
     * Project description
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Highlights (JSON array)
     */
    @Column(name = "highlights", columnDefinition = "TEXT")
    private String highlights;

    /**
     * Awards (JSON array)
     */
    @Column(name = "project_awards", columnDefinition = "TEXT")
    private String projectAwards;

    /**
     * View count
     */
    @Column(name = "views")
    private Integer views = 0;

    /**
     * Background information
     */
    @Column(name = "background", columnDefinition = "TEXT")
    private String background;

    /**
     * Scale information (JSON object: area, height, investment)
     */
    @Column(name = "scale", columnDefinition = "TEXT")
    private String scale;

    /**
     * Design concept
     */
    @Column(name = "design_concept", columnDefinition = "TEXT")
    private String designConcept;

    /**
     * Technical features (JSON array)
     */
    @Column(name = "technical_features", columnDefinition = "TEXT")
    private String technicalFeatures;

    /**
     * Achievements (JSON array)
     */
    @Column(name = "achievements", columnDefinition = "TEXT")
    private String achievements;

    /**
     * Images (JSON array of URLs)
     */
    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    /**
     * Cover image (Base64 encoded)
     */
    @Column(name = "cover_image", columnDefinition = "TEXT")
    private String coverImage;

    /**
     * Status: 1-published, 0-draft
     */
    @Column(name = "status")
    private Integer status = 0;

    /**
     * Sort order
     */
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    /**
     * Increment view count
     */
    public void incrementViews() {
        this.views = (this.views == null ? 0 : this.views) + 1;
    }

    /**
     * Check if published
     */
    public boolean isPublished() {
        return this.status != null && this.status == 1;
    }
}
