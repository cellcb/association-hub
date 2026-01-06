package com.assoc.member.service;

import com.assoc.member.dto.*;
import com.assoc.member.entity.ApplicationStatus;
import com.assoc.member.entity.MemberType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Member application service interface
 */
public interface MemberApplicationService {

    /**
     * Submit a member application
     * @param request Application request
     * @return Application response with ID
     */
    MemberApplicationResponse submitApplication(MemberApplicationRequest request);

    /**
     * Get application by ID
     * @param id Application ID
     * @return Application response
     */
    MemberApplicationResponse getApplicationById(Long id);

    /**
     * Get application status
     * @param id Application ID
     * @return Application status response
     */
    ApplicationStatusResponse getApplicationStatus(Long id);

    /**
     * Get all applications with pagination
     * @param pageable Pagination info
     * @return Page of applications
     */
    Page<MemberApplicationResponse> getAllApplications(Pageable pageable);

    /**
     * Get applications by status
     * @param status Application status
     * @param pageable Pagination info
     * @return Page of applications
     */
    Page<MemberApplicationResponse> getApplicationsByStatus(ApplicationStatus status, Pageable pageable);

    /**
     * Get applications by member type
     * @param memberType Member type
     * @param pageable Pagination info
     * @return Page of applications
     */
    Page<MemberApplicationResponse> getApplicationsByMemberType(MemberType memberType, Pageable pageable);

    /**
     * Search applications by keyword
     * @param keyword Search keyword
     * @param pageable Pagination info
     * @return Page of applications
     */
    Page<MemberApplicationResponse> searchApplications(String keyword, Pageable pageable);

    /**
     * Approve an application (creates user account and member record)
     * @param id Application ID
     * @return Created member response
     */
    MemberResponse approveApplication(Long id);

    /**
     * Reject an application
     * @param id Application ID
     * @param reason Rejection reason
     */
    void rejectApplication(Long id, String reason);

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
     * @return Count of pending applications
     */
    long countPendingApplications();
}
