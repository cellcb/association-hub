package com.assoc.member.service;

import com.assoc.common.profile.MemberProfileProvider;
import com.assoc.member.entity.IndividualMember;
import com.assoc.member.entity.Member;
import com.assoc.member.entity.MemberStatus;
import com.assoc.member.entity.OrganizationMember;
import com.assoc.member.repository.IndividualMemberRepository;
import com.assoc.member.repository.MemberRepository;
import com.assoc.member.repository.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Implementation of MemberProfileProvider for cross-module member profile access.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberProfileProviderImpl implements MemberProfileProvider {

    private final MemberRepository memberRepository;
    private final IndividualMemberRepository individualMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    @Override
    public Optional<MemberProfileData> getMemberProfile(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }

        // Find member by userId
        Optional<Member> memberOpt = memberRepository.findByUserId(userId);
        if (memberOpt.isEmpty()) {
            log.debug("No member found for userId: {}", userId);
            return Optional.empty();
        }

        Member member = memberOpt.get();

        // Only return profile for active members
        if (member.getStatus() != MemberStatus.ACTIVE) {
            log.debug("Member {} is not active (status: {})", member.getId(), member.getStatus());
            return Optional.empty();
        }

        // Build profile based on member type
        return switch (member.getMemberType()) {
            case INDIVIDUAL -> buildIndividualProfile(member);
            case ORGANIZATION -> buildOrganizationProfile(member);
        };
    }

    private Optional<MemberProfileData> buildIndividualProfile(Member member) {
        Optional<IndividualMember> individualOpt = individualMemberRepository.findByMember_Id(member.getId());
        if (individualOpt.isEmpty()) {
            log.warn("Individual member details not found for member: {}", member.getId());
            return Optional.empty();
        }

        IndividualMember individual = individualOpt.get();
        return Optional.of(new MemberProfileData(
            member.getId(),
            member.getMemberNo(),
            member.getMemberType().name(),
            member.getStatus().name(),
            individual.getName(),
            individual.getPhone(),
            individual.getEmail(),
            individual.getOrganization(),
            individual.getPosition()
        ));
    }

    private Optional<MemberProfileData> buildOrganizationProfile(Member member) {
        Optional<OrganizationMember> orgOpt = organizationMemberRepository.findByMember_Id(member.getId());
        if (orgOpt.isEmpty()) {
            log.warn("Organization member details not found for member: {}", member.getId());
            return Optional.empty();
        }

        OrganizationMember org = orgOpt.get();
        return Optional.of(new MemberProfileData(
            member.getId(),
            member.getMemberNo(),
            member.getMemberType().name(),
            member.getStatus().name(),
            org.getContactPerson(),
            org.getContactPhone(),
            org.getContactEmail(),
            org.getOrgName(),
            null  // Organization members don't have position
        ));
    }
}
