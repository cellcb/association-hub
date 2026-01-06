package com.assoc.member.dto;

import com.assoc.member.entity.ApplicationStatus;
import com.assoc.member.entity.MemberType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Member application response DTO
 */
@Data
public class MemberApplicationResponse {

    private Long id;
    private MemberType memberType;
    private String username;
    private String email;
    private String phone;
    private ApplicationStatus status;
    private String applicationData;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private String rejectReason;
    private Long memberId;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    /**
     * Get status description in Chinese
     */
    public String getStatusDescription() {
        return status != null ? status.getDescription() : null;
    }

    /**
     * Get member type description in Chinese
     */
    public String getMemberTypeDescription() {
        return memberType != null ? memberType.getDescription() : null;
    }
}
