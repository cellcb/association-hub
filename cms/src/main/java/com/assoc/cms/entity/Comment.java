package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Comment entity (polymorphic - can be attached to news, project, activity)
 */
@Data
@Entity
@Table(name = "cms_comment")
@EqualsAndHashCode(exclude = {"replies"}, callSuper = true)
@ToString(exclude = {"replies"}, callSuper = true)
public class Comment extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Resource type (NEWS, PROJECT, ACTIVITY)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 20)
    private ResourceType resourceType;

    /**
     * Resource ID
     */
    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    /**
     * Parent comment ID (for replies)
     */
    @Column(name = "parent_id")
    private Long parentId;

    /**
     * Author user ID (optional, null for anonymous)
     */
    @Column(name = "author_id")
    private Long authorId;

    /**
     * Author name (display name)
     */
    @Column(name = "author_name", nullable = false, length = 50)
    private String authorName;

    /**
     * Author avatar URL
     */
    @Column(name = "author_avatar", length = 500)
    private String authorAvatar;

    /**
     * Comment content
     */
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Like count
     */
    @Column(name = "likes")
    private Integer likes = 0;

    /**
     * Status: 1-approved, 0-pending, 2-rejected
     */
    @Column(name = "status")
    private Integer status = 1;

    /**
     * Replies (child comments)
     */
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private List<Comment> replies = new ArrayList<>();

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
     * Check if this is a reply (has parent)
     */
    public boolean isReply() {
        return this.parentId != null;
    }

    /**
     * Check if approved
     */
    public boolean isApproved() {
        return this.status != null && this.status == 1;
    }
}
