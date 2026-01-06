package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * Expert entity
 */
@Data
@Entity
@Table(name = "cms_expert")
@EqualsAndHashCode(exclude = {"expertiseFields"}, callSuper = true)
@ToString(exclude = {"expertiseFields"}, callSuper = true)
public class Expert extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Expert name
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * Professional title
     */
    @Column(name = "title", length = 100)
    private String title;

    /**
     * Organization/Affiliation
     */
    @Column(name = "organization", length = 200)
    private String organization;

    /**
     * Location
     */
    @Column(name = "location", length = 100)
    private String location;

    /**
     * Main achievements
     */
    @Column(name = "achievements", columnDefinition = "TEXT")
    private String achievements;

    /**
     * Email
     */
    @Column(name = "email", length = 100)
    private String email;

    /**
     * Phone
     */
    @Column(name = "phone", length = 20)
    private String phone;

    /**
     * Avatar URL
     */
    @Column(name = "avatar", length = 500)
    private String avatar;

    /**
     * Biography
     */
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    /**
     * Education background (JSON array)
     */
    @Column(name = "education", columnDefinition = "TEXT")
    private String education;

    /**
     * Work experience (JSON array)
     */
    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience;

    /**
     * Representative projects (JSON array)
     */
    @Column(name = "projects", columnDefinition = "TEXT")
    private String projects;

    /**
     * Publications (JSON array)
     */
    @Column(name = "publications", columnDefinition = "TEXT")
    private String publications;

    /**
     * Awards (JSON array)
     */
    @Column(name = "awards", columnDefinition = "TEXT")
    private String awards;

    /**
     * Research areas (JSON array)
     */
    @Column(name = "research_areas", columnDefinition = "TEXT")
    private String researchAreas;

    /**
     * Status: 1-active, 0-inactive
     */
    @Column(name = "status")
    private Integer status = 1;

    /**
     * Sort order
     */
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    /**
     * Expertise fields (many-to-many)
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "cms_expert_expertise",
        joinColumns = @JoinColumn(name = "expert_id"),
        inverseJoinColumns = @JoinColumn(name = "expertise_id")
    )
    private Set<ExpertiseField> expertiseFields = new HashSet<>();

    /**
     * Check if active
     */
    public boolean isActive() {
        return this.status != null && this.status == 1;
    }
}
