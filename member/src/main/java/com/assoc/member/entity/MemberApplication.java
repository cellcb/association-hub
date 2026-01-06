package com.assoc.member.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Member application entity
 * Stores member application information including account credentials
 */
@Data
@Entity
@Table(name = "mbr_member_application")
@EqualsAndHashCode(callSuper = true)
public class MemberApplication extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Member type: INDIVIDUAL or ORGANIZATION
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "member_type", nullable = false, length = 20)
    private MemberType memberType;

    /**
     * Username for login (must be unique)
     */
    @Column(name = "username", nullable = false, length = 50)
    private String username;

    /**
     * Password (encrypted)
     */
    @Column(name = "password", nullable = false, length = 100)
    private String password;

    /**
     * Email address
     */
    @Column(name = "email", nullable = false, length = 100)
    private String email;

    /**
     * Phone number
     */
    @Column(name = "phone", length = 20)
    private String phone;

    /**
     * Application status
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    /**
     * Application data in JSON format (stores complete form data)
     */
    @Column(name = "application_data", columnDefinition = "TEXT")
    private String applicationData;

    /**
     * Reviewed by user ID
     */
    @Column(name = "reviewed_by")
    private Long reviewedBy;

    /**
     * Review time
     */
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /**
     * Rejection reason (if rejected)
     */
    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    /**
     * Member ID created after approval
     */
    @Column(name = "member_id")
    private Long memberId;

    /**
     * Check if application is pending
     */
    public boolean isPending() {
        return ApplicationStatus.PENDING.equals(this.status);
    }

    /**
     * Check if application is approved
     */
    public boolean isApproved() {
        return ApplicationStatus.APPROVED.equals(this.status);
    }

    /**
     * Check if application is rejected
     */
    public boolean isRejected() {
        return ApplicationStatus.REJECTED.equals(this.status);
    }
}
