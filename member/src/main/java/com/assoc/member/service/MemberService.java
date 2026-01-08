package com.assoc.member.service;

import com.assoc.member.dto.*;
import com.assoc.member.entity.MemberStatus;
import com.assoc.member.entity.MemberType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * Member service interface
 */
public interface MemberService {

    /**
     * Get member by ID
     * @param id Member ID
     * @return Member response
     */
    MemberResponse getMemberById(Long id);

    /**
     * Get member by user ID
     * @param userId User ID from iam_user
     * @return Member response
     */
    MemberResponse getMemberByUserId(Long userId);

    /**
     * Get member by member number
     * @param memberNo Member number
     * @return Member response
     */
    MemberResponse getMemberByMemberNo(String memberNo);

    /**
     * Get all members with pagination
     * @param pageable Pagination info
     * @return Page of members
     */
    Page<MemberResponse> getAllMembers(Pageable pageable);

    /**
     * Get members by status
     * @param status Member status
     * @param pageable Pagination info
     * @return Page of members
     */
    Page<MemberResponse> getMembersByStatus(MemberStatus status, Pageable pageable);

    /**
     * Get members by type
     * @param memberType Member type
     * @param pageable Pagination info
     * @return Page of members
     */
    Page<MemberResponse> getMembersByType(MemberType memberType, Pageable pageable);

    /**
     * Search members by keyword
     * @param keyword Search keyword
     * @param pageable Pagination info
     * @return Page of members
     */
    Page<MemberResponse> searchMembers(String keyword, Pageable pageable);

    /**
     * Update individual member
     * @param id Member ID
     * @param request Update request
     * @return Updated member response
     */
    MemberResponse updateIndividualMember(Long id, IndividualMemberUpdateRequest request);

    /**
     * Update organization member
     * @param id Member ID
     * @param request Update request
     * @return Updated member response
     */
    MemberResponse updateOrganizationMember(Long id, OrganizationMemberUpdateRequest request);

    /**
     * Suspend member
     * @param id Member ID
     */
    void suspendMember(Long id);

    /**
     * Activate member
     * @param id Member ID
     */
    void activateMember(Long id);

    /**
     * Delete member
     * @param id Member ID
     */
    void deleteMember(Long id);

    /**
     * Get member statistics
     * @return Statistics response
     */
    MemberStatsResponse getStatistics();

    /**
     * Count total members
     * @return Total count
     */
    long countTotal();

    /**
     * Count active members
     * @return Active count
     */
    long countActive();

    /**
     * Count by member type
     * @param memberType Member type
     * @return Count
     */
    long countByType(MemberType memberType);

    /**
     * Get member registration profile for activity registration auto-fill
     * @param userId User ID from iam_user
     * @return Optional member profile for registration, empty if not a member or not active
     */
    Optional<MemberRegistrationProfileResponse> getMemberRegistrationProfile(Long userId);
}
