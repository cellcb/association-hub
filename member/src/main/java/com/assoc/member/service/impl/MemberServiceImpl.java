package com.assoc.member.service.impl;

import com.assoc.common.exception.BusinessException;
import com.assoc.member.dto.*;
import com.assoc.member.entity.*;
import com.assoc.member.repository.*;
import com.assoc.member.service.MemberService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final IndividualMemberRepository individualMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final ObjectMapper objectMapper;

    @Override
    public MemberResponse getMemberById(Long id) {
        Member member = memberRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException("Member not found: " + id));
        return toResponse(member);
    }

    @Override
    public MemberResponse getMemberByUserId(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Member not found for user: " + userId));
        return toResponse(memberRepository.findByIdWithDetails(member.getId()).orElse(member));
    }

    @Override
    public MemberResponse getMemberByMemberNo(String memberNo) {
        Member member = memberRepository.findByMemberNo(memberNo)
                .orElseThrow(() -> new BusinessException("Member not found: " + memberNo));
        return toResponse(memberRepository.findByIdWithDetails(member.getId()).orElse(member));
    }

    @Override
    public Page<MemberResponse> getAllMembers(Pageable pageable) {
        return memberRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<MemberResponse> getMembersByStatus(MemberStatus status, Pageable pageable) {
        return memberRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    @Override
    public Page<MemberResponse> getMembersByType(MemberType memberType, Pageable pageable) {
        return memberRepository.findByMemberType(memberType, pageable).map(this::toResponse);
    }

    @Override
    public Page<MemberResponse> searchMembers(String keyword, Pageable pageable) {
        return memberRepository.searchByKeyword(keyword, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public MemberResponse updateIndividualMember(Long id, IndividualMemberUpdateRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Member not found: " + id));

        if (member.getMemberType() != MemberType.INDIVIDUAL) {
            throw new BusinessException("Member is not an individual member");
        }

        IndividualMember individual = individualMemberRepository.findByMember_Id(id)
                .orElseThrow(() -> new BusinessException("Individual member details not found"));

        // Update fields if provided
        if (request.getName() != null) individual.setName(request.getName());
        if (request.getGender() != null) individual.setGender(request.getGender());
        if (request.getIdCard() != null) {
            // Check for duplicate ID card
            if (individualMemberRepository.existsByIdCardAndMember_IdNot(request.getIdCard(), id)) {
                throw new BusinessException("ID card already exists");
            }
            individual.setIdCard(request.getIdCard());
        }
        if (request.getPhone() != null) individual.setPhone(request.getPhone());
        if (request.getEmail() != null) individual.setEmail(request.getEmail());
        if (request.getOrganization() != null) individual.setOrganization(request.getOrganization());
        if (request.getPosition() != null) individual.setPosition(request.getPosition());
        if (request.getTitle() != null) individual.setTitle(request.getTitle());
        if (request.getExpertise() != null) {
            try {
                individual.setExpertise(objectMapper.writeValueAsString(request.getExpertise()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize expertise", e);
            }
        }
        if (request.getProvince() != null) individual.setProvince(request.getProvince());
        if (request.getCity() != null) individual.setCity(request.getCity());
        if (request.getAddress() != null) individual.setAddress(request.getAddress());
        if (request.getEducation() != null) individual.setEducation(request.getEducation());
        if (request.getExperience() != null) individual.setExperience(request.getExperience());
        if (request.getAchievements() != null) individual.setAchievements(request.getAchievements());
        if (request.getRecommendation() != null) individual.setRecommendation(request.getRecommendation());
        if (request.getAvatar() != null) individual.setAvatar(request.getAvatar());

        individualMemberRepository.save(individual);
        log.info("Individual member updated: memberId={}", id);

        return getMemberById(id);
    }

    @Override
    @Transactional
    public MemberResponse updateOrganizationMember(Long id, OrganizationMemberUpdateRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Member not found: " + id));

        if (member.getMemberType() != MemberType.ORGANIZATION) {
            throw new BusinessException("Member is not an organization member");
        }

        OrganizationMember organization = organizationMemberRepository.findByMember_Id(id)
                .orElseThrow(() -> new BusinessException("Organization member details not found"));

        // Update fields if provided
        if (request.getOrgName() != null) organization.setOrgName(request.getOrgName());
        if (request.getOrgType() != null) organization.setOrgType(request.getOrgType());
        if (request.getSocialCreditCode() != null) {
            // Check for duplicate social credit code
            if (organizationMemberRepository.existsBySocialCreditCodeAndMember_IdNot(request.getSocialCreditCode(), id)) {
                throw new BusinessException("Social credit code already exists");
            }
            organization.setSocialCreditCode(request.getSocialCreditCode());
        }
        if (request.getLegalRepresentative() != null) organization.setLegalRepresentative(request.getLegalRepresentative());
        if (request.getContactPerson() != null) organization.setContactPerson(request.getContactPerson());
        if (request.getContactPhone() != null) organization.setContactPhone(request.getContactPhone());
        if (request.getContactEmail() != null) organization.setContactEmail(request.getContactEmail());
        if (request.getEstablishmentDate() != null) organization.setEstablishmentDate(request.getEstablishmentDate());
        if (request.getRegisteredCapital() != null) organization.setRegisteredCapital(request.getRegisteredCapital());
        if (request.getEmployeeCount() != null) organization.setEmployeeCount(request.getEmployeeCount());
        if (request.getBusinessScope() != null) organization.setBusinessScope(request.getBusinessScope());
        if (request.getQualifications() != null) {
            try {
                organization.setQualifications(objectMapper.writeValueAsString(request.getQualifications()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize qualifications", e);
            }
        }
        if (request.getProjects() != null) {
            try {
                organization.setProjects(objectMapper.writeValueAsString(request.getProjects()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize projects", e);
            }
        }
        if (request.getProvince() != null) organization.setProvince(request.getProvince());
        if (request.getCity() != null) organization.setCity(request.getCity());
        if (request.getAddress() != null) organization.setAddress(request.getAddress());
        if (request.getWebsite() != null) organization.setWebsite(request.getWebsite());
        if (request.getIntroduction() != null) organization.setIntroduction(request.getIntroduction());
        if (request.getLogo() != null) organization.setLogo(request.getLogo());

        organizationMemberRepository.save(organization);
        log.info("Organization member updated: memberId={}", id);

        return getMemberById(id);
    }

    @Override
    @Transactional
    public void suspendMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Member not found: " + id));

        member.setStatus(MemberStatus.SUSPENDED);
        memberRepository.save(member);
        log.info("Member suspended: id={}", id);
    }

    @Override
    @Transactional
    public void activateMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Member not found: " + id));

        member.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(member);
        log.info("Member activated: id={}", id);
    }

    @Override
    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Member not found: " + id));

        // Delete is cascaded to individual/organization member
        memberRepository.delete(member);
        log.info("Member deleted: id={}", id);
    }

    @Override
    public MemberStatsResponse getStatistics() {
        long total = memberRepository.count();
        long active = memberRepository.countByStatus(MemberStatus.ACTIVE);
        long expired = memberRepository.countByStatus(MemberStatus.EXPIRED);
        long suspended = memberRepository.countByStatus(MemberStatus.SUSPENDED);
        long individual = memberRepository.countByMemberType(MemberType.INDIVIDUAL);
        long organization = memberRepository.countByMemberType(MemberType.ORGANIZATION);
        long pending = memberRepository.countByStatus(MemberStatus.PENDING);

        return MemberStatsResponse.builder()
                .totalMembers(total)
                .activeMembers(active)
                .expiredMembers(expired)
                .suspendedMembers(suspended)
                .individualMembers(individual)
                .organizationMembers(organization)
                .pendingApplications(pending)
                .growthRate(0.0) // TODO: Calculate growth rate
                .build();
    }

    @Override
    public long countTotal() {
        return memberRepository.count();
    }

    @Override
    public long countActive() {
        return memberRepository.countActive();
    }

    @Override
    public long countByType(MemberType memberType) {
        return memberRepository.countByMemberType(memberType);
    }

    @Override
    public Optional<MemberRegistrationProfileResponse> getMemberRegistrationProfile(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }

        return memberRepository.findByUserId(userId)
                .filter(Member::isActive)
                .map(member -> {
                    MemberRegistrationProfileResponse response = new MemberRegistrationProfileResponse();
                    response.setMemberId(member.getId());
                    response.setMemberNo(member.getMemberNo());
                    response.setMemberType(member.getMemberType().name());
                    response.setMemberStatus(member.getStatus().name());

                    if (member.getMemberType() == MemberType.INDIVIDUAL) {
                        individualMemberRepository.findByMember_Id(member.getId())
                                .ifPresent(individual -> {
                                    response.setName(individual.getName());
                                    response.setPhone(individual.getPhone());
                                    response.setEmail(individual.getEmail());
                                    response.setCompany(individual.getOrganization());
                                    response.setPosition(individual.getPosition());
                                });
                    } else {
                        organizationMemberRepository.findByMember_Id(member.getId())
                                .ifPresent(organization -> {
                                    response.setName(organization.getContactPerson());
                                    response.setPhone(organization.getContactPhone());
                                    response.setEmail(organization.getContactEmail());
                                    response.setCompany(organization.getOrgName());
                                    response.setPosition(null);
                                });
                    }

                    return response;
                });
    }

    private MemberResponse toResponse(Member member) {
        MemberResponse response = new MemberResponse();
        response.setId(member.getId());
        response.setUserId(member.getUserId());
        response.setMemberNo(member.getMemberNo());
        response.setMemberType(member.getMemberType());
        response.setMemberTypeDescription(member.getMemberType().getDescription());
        response.setStatus(member.getStatus());
        response.setStatusDescription(member.getStatus().getDescription());
        response.setApprovedAt(member.getApprovedAt());
        response.setExpiredAt(member.getExpiredAt());
        response.setCreatedTime(member.getCreatedTime());
        response.setUpdatedTime(member.getUpdatedTime());
        response.setDisplayName(member.getDisplayName());

        if (member.getIndividualMember() != null) {
            response.setIndividualMember(toIndividualResponse(member.getIndividualMember()));
        }
        if (member.getOrganizationMember() != null) {
            response.setOrganizationMember(toOrganizationResponse(member.getOrganizationMember()));
        }

        return response;
    }

    private MemberResponse.IndividualMemberResponse toIndividualResponse(IndividualMember individual) {
        MemberResponse.IndividualMemberResponse response = new MemberResponse.IndividualMemberResponse();
        response.setId(individual.getId());
        response.setName(individual.getName());
        response.setGender(individual.getGender());
        response.setIdCard(individual.getIdCard());
        response.setPhone(individual.getPhone());
        response.setEmail(individual.getEmail());
        response.setOrganization(individual.getOrganization());
        response.setPosition(individual.getPosition());
        response.setTitle(individual.getTitle());
        response.setExpertise(individual.getExpertise());
        response.setProvince(individual.getProvince());
        response.setCity(individual.getCity());
        response.setAddress(individual.getAddress());
        response.setEducation(individual.getEducation());
        response.setExperience(individual.getExperience());
        response.setAchievements(individual.getAchievements());
        response.setRecommendation(individual.getRecommendation());
        response.setAvatar(individual.getAvatar());
        return response;
    }

    private MemberResponse.OrganizationMemberResponse toOrganizationResponse(OrganizationMember organization) {
        MemberResponse.OrganizationMemberResponse response = new MemberResponse.OrganizationMemberResponse();
        response.setId(organization.getId());
        response.setOrgName(organization.getOrgName());
        response.setOrgType(organization.getOrgType().getCode());
        response.setOrgTypeDescription(organization.getOrgType().getDescription());
        response.setSocialCreditCode(organization.getSocialCreditCode());
        response.setLegalRepresentative(organization.getLegalRepresentative());
        response.setContactPerson(organization.getContactPerson());
        response.setContactPhone(organization.getContactPhone());
        response.setContactEmail(organization.getContactEmail());
        if (organization.getEstablishmentDate() != null) {
            response.setEstablishmentDate(organization.getEstablishmentDate().toString());
        }
        if (organization.getRegisteredCapital() != null) {
            response.setRegisteredCapital(organization.getRegisteredCapital().toString());
        }
        response.setEmployeeCount(organization.getEmployeeCount());
        response.setBusinessScope(organization.getBusinessScope());
        response.setQualifications(organization.getQualifications());
        response.setProjects(organization.getProjects());
        response.setProvince(organization.getProvince());
        response.setCity(organization.getCity());
        response.setAddress(organization.getAddress());
        response.setWebsite(organization.getWebsite());
        response.setIntroduction(organization.getIntroduction());
        response.setLogo(organization.getLogo());
        return response;
    }
}
