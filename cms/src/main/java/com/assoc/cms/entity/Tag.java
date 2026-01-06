package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Tag entity for news articles
 */
@Data
@Entity
@Table(name = "cms_tag")
@EqualsAndHashCode(callSuper = true)
public class Tag extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tag name
     */
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    /**
     * Usage count
     */
    @Column(name = "usage_count")
    private Integer usageCount = 0;

    /**
     * Increment usage count
     */
    public void incrementUsage() {
        this.usageCount = (this.usageCount == null ? 0 : this.usageCount) + 1;
    }

    /**
     * Decrement usage count
     */
    public void decrementUsage() {
        if (this.usageCount != null && this.usageCount > 0) {
            this.usageCount--;
        }
    }
}
