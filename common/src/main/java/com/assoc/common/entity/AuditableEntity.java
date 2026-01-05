package com.assoc.common.entity;

import com.assoc.common.context.RequestContext;
import com.assoc.common.context.RequestContextHolder;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 可审计实体基类
 * 所有需要审计功能的业务实体都应继承此类
 *
 * 自动功能：
 * 1. 自动管理审计字段（created_by, updated_by, created_time, updated_time）
 */
@Data
@MappedSuperclass
public abstract class AuditableEntity {

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_time")
    private LocalDateTime createdTime;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @PrePersist
    protected void onCreate() {
        this.createdTime = LocalDateTime.now();
        this.updatedTime = LocalDateTime.now();

        RequestContext context = RequestContextHolder.getRequestContext();
        context.currentUserId().ifPresent(userId -> {
            if (this.createdBy == null) {
                this.createdBy = userId;
            }
            this.updatedBy = userId;
        });
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedTime = LocalDateTime.now();

        RequestContext context = RequestContextHolder.getRequestContext();
        context.currentUserId().ifPresent(userId -> this.updatedBy = userId);
    }
}
