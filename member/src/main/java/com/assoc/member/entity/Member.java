package com.assoc.member.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Member base entity
 * Links to iam_user after application approval
 */
@Data
@Entity
@Table(name = "mbr_member")
@EqualsAndHashCode(exclude = {"individualMember", "organizationMember"}, callSuper = true)
@ToString(exclude = {"individualMember", "organizationMember"}, callSuper = true)
public class Member extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Associated user ID from iam_user table
     */
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    /**
     * Member number (unique identifier)
     */
    @Column(name = "member_no", nullable = false, unique = true, length = 50)
    private String memberNo;

    /**
     * Member type
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "member_type", nullable = false, length = 20)
    private MemberType memberType;

    /**
     * Member status
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MemberStatus status = MemberStatus.PENDING;

    /**
     * Approval time
     */
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    /**
     * Expiration time
     */
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    /**
     * Reject reason (when status is REJECTED)
     */
    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    /**
     * Reviewed by user ID
     */
    @Column(name = "reviewed_by")
    private Long reviewedBy;

    /**
     * Reviewed at time
     */
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /**
     * Individual member details (for INDIVIDUAL type)
     */
    @OneToOne(mappedBy = "member", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private IndividualMember individualMember;

    /**
     * Organization member details (for ORGANIZATION type)
     */
    @OneToOne(mappedBy = "member", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private OrganizationMember organizationMember;

    /**
     * Check if member is active
     */
    public boolean isActive() {
        if (!MemberStatus.ACTIVE.equals(this.status)) {
            return false;
        }
        if (this.expiredAt != null && this.expiredAt.isBefore(LocalDateTime.now())) {
            return false;
        }
        return true;
    }

    /**
     * Check if member is expired
     */
    public boolean isExpired() {
        return MemberStatus.EXPIRED.equals(this.status) ||
               (this.expiredAt != null && this.expiredAt.isBefore(LocalDateTime.now()));
    }

    /**
     * Check if member is pending approval
     */
    public boolean isPending() {
        return MemberStatus.PENDING.equals(this.status);
    }

    /**
     * Check if member application is rejected
     */
    public boolean isRejected() {
        return MemberStatus.REJECTED.equals(this.status);
    }

    /**
     * Get display name based on member type
     */
    public String getDisplayName() {
        if (MemberType.INDIVIDUAL.equals(this.memberType) && this.individualMember != null) {
            return this.individualMember.getName();
        }
        if (MemberType.ORGANIZATION.equals(this.memberType) && this.organizationMember != null) {
            return this.organizationMember.getOrgName();
        }
        return this.memberNo;
    }
}
