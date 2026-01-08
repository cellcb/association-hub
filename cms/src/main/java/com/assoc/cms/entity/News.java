package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * News article entity
 */
@Data
@Entity
@Table(name = "cms_news")
@EqualsAndHashCode(exclude = {"category", "tags"}, callSuper = true)
@ToString(exclude = {"category", "tags"}, callSuper = true)
public class News extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Article title
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * Article excerpt/summary
     */
    @Column(name = "excerpt", length = 500)
    private String excerpt;

    /**
     * Full article content (HTML)
     */
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    /**
     * Category
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private NewsCategory category;

    /**
     * Author name
     */
    @Column(name = "author", length = 50)
    private String author;

    /**
     * Cover image (URL or Base64)
     */
    @Column(name = "cover_image", columnDefinition = "TEXT")
    private String coverImage;

    /**
     * View count
     */
    @Column(name = "views")
    private Integer views = 0;

    /**
     * Like count
     */
    @Column(name = "likes")
    private Integer likes = 0;

    /**
     * Is featured/pinned
     */
    @Column(name = "featured")
    private Boolean featured = false;

    /**
     * Status: 1-published, 0-draft, 2-archived
     */
    @Column(name = "status")
    private Integer status = 0;

    /**
     * Published time
     */
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    /**
     * Tags
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "cms_news_tag",
        joinColumns = @JoinColumn(name = "news_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    /**
     * Increment view count
     */
    public void incrementViews() {
        this.views = (this.views == null ? 0 : this.views) + 1;
    }

    /**
     * Increment like count
     */
    public void incrementLikes() {
        this.likes = (this.likes == null ? 0 : this.likes) + 1;
    }

    /**
     * Decrement like count
     */
    public void decrementLikes() {
        if (this.likes != null && this.likes > 0) {
            this.likes--;
        }
    }

    /**
     * Check if published
     */
    public boolean isPublished() {
        return this.status != null && this.status == 1;
    }

    /**
     * Check if draft
     */
    public boolean isDraft() {
        return this.status == null || this.status == 0;
    }

    /**
     * Get category ID
     */
    public Long getCategoryId() {
        return category != null ? category.getId() : null;
    }
}
