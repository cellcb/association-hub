package com.assoc.member.service;

import com.assoc.member.dto.*;

/**
 * Member application service interface
 * Handles member application submission and approval workflow
 */
public interface MemberApplicationService {

    /**
     * Submit a member application
     * Creates User (disabled) + Member (PENDING) + detail record
     * @param request Application request
     * @return Member response with ID
     */
    MemberResponse submitApplication(MemberApplicationRequest request);

    /**
     * Get application status by member ID
     * @param memberId Member ID
     * @return Application status response
     */
    ApplicationStatusResponse getApplicationStatus(Long memberId);

    /**
     * Approve a member application
     * Enables IAM user and sets member status to ACTIVE
     * @param memberId Member ID
     * @return Updated member response
     */
    MemberResponse approveApplication(Long memberId);

    /**
     * Reject a member application
     * Sets member status to REJECTED with reason
     * @param memberId Member ID
     * @param reason Rejection reason
     */
    void rejectApplication(Long memberId, String reason);

    /**
     * Check if username is available
     * @param username Username to check
     * @return true if available
     */
    boolean isUsernameAvailable(String username);

    /**
     * Check if email is available
     * @param email Email to check
     * @return true if available
     */
    boolean isEmailAvailable(String email);

    /**
     * Count pending applications
     * @return Count of pending members
     */
    long countPendingApplications();
}
