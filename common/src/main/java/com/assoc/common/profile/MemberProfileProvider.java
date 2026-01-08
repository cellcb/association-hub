package com.assoc.common.profile;

import java.util.Optional;

/**
 * Interface for providing member profile information.
 * Implemented by member module, consumed by IAM module.
 */
public interface MemberProfileProvider {

    /**
     * Get member registration profile for activity registration auto-fill.
     *
     * @param userId the user ID
     * @return member profile if user is an active member, empty otherwise
     */
    Optional<MemberProfileData> getMemberProfile(Long userId);

    /**
     * Member profile data for activity registration.
     */
    record MemberProfileData(
        Long memberId,
        String memberNo,
        String memberType,
        String memberStatus,
        String name,
        String phone,
        String email,
        String company,
        String position
    ) {}
}
