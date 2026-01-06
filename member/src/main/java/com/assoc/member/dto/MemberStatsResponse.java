package com.assoc.member.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Member statistics response DTO
 */
@Data
@Builder
public class MemberStatsResponse {

    /**
     * Total member count
     */
    private long totalMembers;

    /**
     * Active member count
     */
    private long activeMembers;

    /**
     * Expired member count
     */
    private long expiredMembers;

    /**
     * Suspended member count
     */
    private long suspendedMembers;

    /**
     * Individual member count
     */
    private long individualMembers;

    /**
     * Organization member count
     */
    private long organizationMembers;

    /**
     * Pending application count
     */
    private long pendingApplications;

    /**
     * Growth rate compared to last month (percentage)
     */
    private double growthRate;
}
