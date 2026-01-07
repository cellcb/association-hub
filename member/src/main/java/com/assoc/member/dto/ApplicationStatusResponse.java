package com.assoc.member.dto;

import com.assoc.member.entity.MemberStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Application status response DTO
 */
@Data
public class ApplicationStatusResponse {

    private Long memberId;
    private MemberStatus status;
    private String statusDescription;
    private String rejectReason;
    private String memberNo;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdTime;

    public static ApplicationStatusResponse of(Long memberId, MemberStatus status,
            String rejectReason, String memberNo,
            LocalDateTime reviewedAt, LocalDateTime createdTime) {
        ApplicationStatusResponse response = new ApplicationStatusResponse();
        response.setMemberId(memberId);
        response.setStatus(status);
        response.setStatusDescription(status != null ? status.getDescription() : null);
        response.setRejectReason(rejectReason);
        response.setMemberNo(memberNo);
        response.setReviewedAt(reviewedAt);
        response.setCreatedTime(createdTime);
        return response;
    }
}
