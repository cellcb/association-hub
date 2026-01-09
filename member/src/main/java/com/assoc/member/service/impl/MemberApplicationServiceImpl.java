package com.assoc.member.service.impl;

import com.assoc.common.exception.BusinessException;
import com.assoc.iam.dto.UserRequest;
import com.assoc.iam.repository.RoleRepository;
import com.assoc.iam.service.UserService;
import com.assoc.member.dto.*;
import com.assoc.member.entity.*;
import com.assoc.member.repository.*;
import com.assoc.member.service.MemberApplicationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberApplicationServiceImpl implements MemberApplicationService {

    private final MemberRepository memberRepository;
    private final IndividualMemberRepository individualMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public MemberResponse submitApplication(MemberApplicationRequest request) {
        // Validate username availability
        if (!isUsernameAvailable(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        // Validate email availability
        if (!isEmailAvailable(request.getEmail())) {
            throw new BusinessException("邮箱已被使用");
        }

        // 1. Create IAM user account (DISABLED - cannot login until approved)
        UserRequest userRequest = new UserRequest();
        userRequest.setUsername(request.getUsername());
        userRequest.setPassword(passwordEncoder.encode(request.getPassword()));
        userRequest.setPasswordEncrypted(true);
        userRequest.setEmail(request.getEmail());
        userRequest.setPhone(request.getPhone());
        userRequest.setStatus(0); // Disabled - cannot login

        // Set real name based on member type
        if (request.getMemberType() == MemberType.INDIVIDUAL && request.getIndividualData() != null) {
            userRequest.setRealName(request.getIndividualData().getName());
        } else if (request.getOrganizationData() != null) {
            userRequest.setRealName(request.getOrganizationData().getContactPerson());
        }

        var userResponse = userService.createUser(userRequest);
        Long userId = userResponse.getId();
        log.info("Created disabled user for application: userId={}, username={}", userId, request.getUsername());

        // 1.1 Assign USER role
        roleRepository.findByCode("USER").ifPresent(role -> {
            userService.assignRoles(userId, Set.of(role.getId()));
            log.info("Assigned USER role to new user: userId={}", userId);
        });

        // 2. Create Member record with PENDING status
        Member member = new Member();
        member.setUserId(userId);
        member.setMemberNo(generateMemberNo(request.getMemberType()));
        member.setMemberType(request.getMemberType());
        member.setStatus(MemberStatus.PENDING);

        member = memberRepository.save(member);
        log.info("Created pending member: memberId={}, memberNo={}", member.getId(), member.getMemberNo());

        // 3. Create member detail record
        if (request.getMemberType() == MemberType.INDIVIDUAL) {
            createIndividualMember(member, request.getIndividualData(), request.getPhone(), request.getEmail());
        } else {
            createOrganizationMember(member, request.getOrganizationData(), request.getPhone(), request.getEmail());
        }

        log.info("Member application submitted: memberId={}, username={}", member.getId(), request.getUsername());

        // Reload member with details
        return toMemberResponse(memberRepository.findByIdWithDetails(member.getId())
                .orElseThrow(() -> new BusinessException("Member not found after creation")));
    }

    @Override
    public ApplicationStatusResponse getApplicationStatus(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException("会员不存在: " + memberId));

        return ApplicationStatusResponse.of(
                member.getId(),
                member.getStatus(),
                member.getRejectReason(),
                member.getMemberNo(),
                member.getReviewedAt(),
                member.getCreatedTime()
        );
    }

    @Override
    @Transactional
    public MemberResponse approveApplication(Long memberId) {
        Member member = memberRepository.findByIdWithDetails(memberId)
                .orElseThrow(() -> new BusinessException("会员不存在: " + memberId));

        if (!member.isPending()) {
            throw new BusinessException("会员申请不在待审核状态: " + member.getStatus().getDescription());
        }

        // 1. Enable IAM user (allow login)
        userService.enableUser(member.getUserId());
        log.info("Enabled user for approved member: userId={}", member.getUserId());

        // 2. Update member status
        member.setStatus(MemberStatus.ACTIVE);
        member.setApprovedAt(LocalDateTime.now());
        member.setReviewedAt(LocalDateTime.now());
        // Set expiration to 1 year from now
        member.setExpiredAt(LocalDateTime.now().plusYears(1));

        memberRepository.save(member);

        log.info("Member application approved: memberId={}, userId={}", memberId, member.getUserId());

        return toMemberResponse(member);
    }

    @Override
    @Transactional
    public void rejectApplication(Long memberId, String reason) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException("会员不存在: " + memberId));

        if (!member.isPending()) {
            throw new BusinessException("会员申请不在待审核状态: " + member.getStatus().getDescription());
        }

        member.setStatus(MemberStatus.REJECTED);
        member.setRejectReason(reason);
        member.setReviewedAt(LocalDateTime.now());
        memberRepository.save(member);

        log.info("Member application rejected: memberId={}, reason={}", memberId, reason);
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        return !userService.existsByUsername(username);
    }

    @Override
    public boolean isEmailAvailable(String email) {
        return !userService.existsByEmail(email);
    }

    @Override
    public long countPendingApplications() {
        return memberRepository.countByStatus(MemberStatus.PENDING);
    }

    private void createIndividualMember(Member member, MemberApplicationRequest.IndividualApplicationData data,
                                        String phone, String email) {
        IndividualMember individual = new IndividualMember();
        individual.setMember(member);
        individual.setName(data.getName());
        individual.setGender(data.getGender());
        individual.setIdCard(data.getIdCard());
        individual.setPhone(phone);
        individual.setEmail(email);
        individual.setOrganization(data.getOrganization());
        individual.setPosition(data.getPosition());
        individual.setTitle(data.getTitle());
        if (data.getExpertise() != null) {
            try {
                individual.setExpertise(objectMapper.writeValueAsString(data.getExpertise()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize expertise", e);
            }
        }
        individual.setProvince(data.getProvince());
        individual.setCity(data.getCity());
        individual.setAddress(data.getAddress());
        individual.setEducation(data.getEducation());
        individual.setExperience(data.getExperience());
        individual.setAchievements(data.getAchievements());
        individual.setRecommendation(data.getRecommendation());

        individualMemberRepository.save(individual);
        log.info("Created individual member detail: memberId={}", member.getId());
    }

    private void createOrganizationMember(Member member, MemberApplicationRequest.OrganizationApplicationData data,
                                          String phone, String email) {
        OrganizationMember organization = new OrganizationMember();
        organization.setMember(member);
        organization.setOrgName(data.getOrgName());
        organization.setOrgType(OrganizationType.valueOf(data.getOrgType().toUpperCase()));
        organization.setSocialCreditCode(data.getSocialCreditCode());
        organization.setLegalRepresentative(data.getLegalRepresentative());
        organization.setContactPerson(data.getContactPerson());
        organization.setContactPhone(data.getContactPhone() != null ? data.getContactPhone() : phone);
        organization.setContactEmail(data.getContactEmail() != null ? data.getContactEmail() : email);
        if (data.getEstablishmentDate() != null && !data.getEstablishmentDate().isBlank()) {
            organization.setEstablishmentDate(LocalDate.parse(data.getEstablishmentDate()));
        }
        if (data.getRegisteredCapital() != null && !data.getRegisteredCapital().isBlank()) {
            organization.setRegisteredCapital(new BigDecimal(data.getRegisteredCapital()));
        }
        organization.setEmployeeCount(data.getEmployeeCount());
        organization.setBusinessScope(data.getBusinessScope());
        if (data.getQualifications() != null) {
            try {
                organization.setQualifications(objectMapper.writeValueAsString(data.getQualifications()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize qualifications", e);
            }
        }
        if (data.getProjects() != null) {
            try {
                organization.setProjects(objectMapper.writeValueAsString(data.getProjects()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize projects", e);
            }
        }
        organization.setProvince(data.getProvince());
        organization.setCity(data.getCity());
        organization.setAddress(data.getAddress());
        organization.setWebsite(data.getWebsite());
        organization.setIntroduction(data.getIntroduction());

        organizationMemberRepository.save(organization);
        log.info("Created organization member detail: memberId={}", member.getId());
    }

    private String generateMemberNo(MemberType memberType) {
        String prefix = memberType == MemberType.INDIVIDUAL ? "P" : "O";
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return prefix + date + random;
    }

    private MemberResponse toMemberResponse(Member member) {
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
