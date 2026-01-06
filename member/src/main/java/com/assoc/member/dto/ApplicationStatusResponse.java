package com.assoc.member.dto;

import com.assoc.member.entity.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Application status response DTO
 */
@Data
public class ApplicationStatusResponse {

    private Long applicationId;
    private ApplicationStatus status;
    private String statusDescription;
    private String rejectReason;
    private Long memberId;
    private String memberNo;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdTime;

    public static ApplicationStatusResponse of(Long applicationId, ApplicationStatus status,
            String rejectReason, Long memberId, String memberNo,
            LocalDateTime reviewedAt, LocalDateTime createdTime) {
        ApplicationStatusResponse response = new ApplicationStatusResponse();
        response.setApplicationId(applicationId);
        response.setStatus(status);
        response.setStatusDescription(status != null ? status.getDescription() : null);
        response.setRejectReason(rejectReason);
        response.setMemberId(memberId);
        response.setMemberNo(memberNo);
        response.setReviewedAt(reviewedAt);
        response.setCreatedTime(createdTime);
        return response;
    }
}
