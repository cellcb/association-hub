package com.assoc.member.service.impl;

import com.assoc.common.exception.BusinessException;
import com.assoc.iam.dto.UserRequest;
import com.assoc.iam.service.UserService;
import com.assoc.member.dto.*;
import com.assoc.member.entity.*;
import com.assoc.member.repository.*;
import com.assoc.member.service.MemberApplicationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberApplicationServiceImpl implements MemberApplicationService {

    private final MemberApplicationRepository applicationRepository;
    private final MemberRepository memberRepository;
    private final IndividualMemberRepository individualMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public MemberApplicationResponse submitApplication(MemberApplicationRequest request) {
        // Validate username availability
        if (!isUsernameAvailable(request.getUsername())) {
            throw new BusinessException("Username already exists");
        }

        // Validate email availability
        if (!isEmailAvailable(request.getEmail())) {
            throw new BusinessException("Email already exists");
        }

        // Create application entity
        MemberApplication application = new MemberApplication();
        application.setMemberType(request.getMemberType());
        application.setUsername(request.getUsername());
        application.setPassword(passwordEncoder.encode(request.getPassword()));
        application.setEmail(request.getEmail());
        application.setPhone(request.getPhone());
        application.setStatus(ApplicationStatus.PENDING);

        // Store application data as JSON
        try {
            if (request.getMemberType() == MemberType.INDIVIDUAL) {
                application.setApplicationData(objectMapper.writeValueAsString(request.getIndividualData()));
            } else {
                application.setApplicationData(objectMapper.writeValueAsString(request.getOrganizationData()));
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize application data", e);
            throw new BusinessException("Failed to process application data");
        }

        application = applicationRepository.save(application);
        log.info("Member application submitted: id={}, username={}", application.getId(), application.getUsername());

        return toResponse(application);
    }

    @Override
    public MemberApplicationResponse getApplicationById(Long id) {
        MemberApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Application not found: " + id));
        return toResponse(application);
    }

    @Override
    public ApplicationStatusResponse getApplicationStatus(Long id) {
        MemberApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Application not found: " + id));

        String memberNo = null;
        if (application.getMemberId() != null) {
            memberNo = memberRepository.findById(application.getMemberId())
                    .map(Member::getMemberNo)
                    .orElse(null);
        }

        return ApplicationStatusResponse.of(
                application.getId(),
                application.getStatus(),
                application.getRejectReason(),
                application.getMemberId(),
                memberNo,
                application.getReviewedAt(),
                application.getCreatedTime()
        );
    }

    @Override
    public Page<MemberApplicationResponse> getAllApplications(Pageable pageable) {
        return applicationRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<MemberApplicationResponse> getApplicationsByStatus(ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    @Override
    public Page<MemberApplicationResponse> getApplicationsByMemberType(MemberType memberType, Pageable pageable) {
        return applicationRepository.findByMemberType(memberType, pageable).map(this::toResponse);
    }

    @Override
    public Page<MemberApplicationResponse> searchApplications(String keyword, Pageable pageable) {
        return applicationRepository.searchByKeyword(keyword, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public MemberResponse approveApplication(Long id) {
        MemberApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Application not found: " + id));

        if (!application.isPending()) {
            throw new BusinessException("Application is not pending: " + application.getStatus());
        }

        // Check username availability again (in case it was taken)
        if (userService.existsByUsername(application.getUsername())) {
            throw new BusinessException("Username already taken: " + application.getUsername());
        }

        // 1. Create IAM user account
        UserRequest userRequest = new UserRequest();
        userRequest.setUsername(application.getUsername());
        userRequest.setPassword(application.getPassword());
        userRequest.setPasswordEncrypted(true); // 标记密码已加密，避免二次加密
        userRequest.setEmail(application.getEmail());
        userRequest.setPhone(application.getPhone());
        userRequest.setStatus(1); // Active

        // Set real name based on member type
        if (application.getMemberType() == MemberType.INDIVIDUAL) {
            try {
                MemberApplicationRequest.IndividualApplicationData data =
                        objectMapper.readValue(application.getApplicationData(),
                                MemberApplicationRequest.IndividualApplicationData.class);
                userRequest.setRealName(data.getName());
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse individual application data", e);
            }
        } else {
            try {
                MemberApplicationRequest.OrganizationApplicationData data =
                        objectMapper.readValue(application.getApplicationData(),
                                MemberApplicationRequest.OrganizationApplicationData.class);
                userRequest.setRealName(data.getContactPerson());
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse organization application data", e);
            }
        }

        var userResponse = userService.createUser(userRequest);
        Long userId = userResponse.getId();

        // 2. Create Member record
        Member member = new Member();
        member.setUserId(userId);
        member.setMemberNo(generateMemberNo(application.getMemberType()));
        member.setMemberType(application.getMemberType());
        member.setStatus(MemberStatus.ACTIVE);
        member.setApprovedAt(LocalDateTime.now());
        member.setApplicationId(application.getId());
        // Set expiration to 1 year from now
        member.setExpiredAt(LocalDateTime.now().plusYears(1));

        member = memberRepository.save(member);

        // 3. Create member detail record
        if (application.getMemberType() == MemberType.INDIVIDUAL) {
            createIndividualMember(member, application);
        } else {
            createOrganizationMember(member, application);
        }

        // 4. Update application status
        application.setStatus(ApplicationStatus.APPROVED);
        application.setReviewedAt(LocalDateTime.now());
        application.setMemberId(member.getId());
        applicationRepository.save(application);

        // 5. Assign default member role (if exists)
        // This would need to be configured in the system
        // userService.assignRoles(userId, Set.of(memberRoleId));

        log.info("Member application approved: applicationId={}, memberId={}, userId={}",
                id, member.getId(), userId);

        // Reload member with details
        return toMemberResponse(memberRepository.findByIdWithDetails(member.getId())
                .orElseThrow(() -> new BusinessException("Member not found after creation")));
    }

    @Override
    @Transactional
    public void rejectApplication(Long id, String reason) {
        MemberApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Application not found: " + id));

        if (!application.isPending()) {
            throw new BusinessException("Application is not pending: " + application.getStatus());
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectReason(reason);
        application.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(application);

        log.info("Member application rejected: id={}, reason={}", id, reason);
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        // Check both applications and existing users
        return !applicationRepository.existsByUsername(username) &&
               !userService.existsByUsername(username);
    }

    @Override
    public boolean isEmailAvailable(String email) {
        // Check both applications and existing users
        return !applicationRepository.existsByEmail(email) &&
               !userService.existsByEmail(email);
    }

    @Override
    public long countPendingApplications() {
        return applicationRepository.countPending();
    }

    private void createIndividualMember(Member member, MemberApplication application) {
        try {
            MemberApplicationRequest.IndividualApplicationData data =
                    objectMapper.readValue(application.getApplicationData(),
                            MemberApplicationRequest.IndividualApplicationData.class);

            IndividualMember individual = new IndividualMember();
            individual.setMember(member);
            individual.setName(data.getName());
            individual.setGender(data.getGender());
            individual.setIdCard(data.getIdCard());
            individual.setPhone(application.getPhone());
            individual.setEmail(application.getEmail());
            individual.setOrganization(data.getOrganization());
            individual.setPosition(data.getPosition());
            individual.setTitle(data.getTitle());
            if (data.getExpertise() != null) {
                individual.setExpertise(objectMapper.writeValueAsString(data.getExpertise()));
            }
            individual.setProvince(data.getProvince());
            individual.setCity(data.getCity());
            individual.setAddress(data.getAddress());
            individual.setEducation(data.getEducation());
            individual.setExperience(data.getExperience());
            individual.setAchievements(data.getAchievements());
            individual.setRecommendation(data.getRecommendation());

            individualMemberRepository.save(individual);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse individual application data", e);
            throw new BusinessException("Failed to process individual member data");
        }
    }

    private void createOrganizationMember(Member member, MemberApplication application) {
        try {
            MemberApplicationRequest.OrganizationApplicationData data =
                    objectMapper.readValue(application.getApplicationData(),
                            MemberApplicationRequest.OrganizationApplicationData.class);

            OrganizationMember organization = new OrganizationMember();
            organization.setMember(member);
            organization.setOrgName(data.getOrgName());
            organization.setOrgType(OrganizationType.valueOf(data.getOrgType().toUpperCase()));
            organization.setSocialCreditCode(data.getSocialCreditCode());
            organization.setLegalRepresentative(data.getLegalRepresentative());
            organization.setContactPerson(data.getContactPerson());
            organization.setContactPhone(data.getContactPhone() != null ? data.getContactPhone() : application.getPhone());
            organization.setContactEmail(data.getContactEmail() != null ? data.getContactEmail() : application.getEmail());
            if (data.getEstablishmentDate() != null) {
                organization.setEstablishmentDate(LocalDate.parse(data.getEstablishmentDate()));
            }
            if (data.getRegisteredCapital() != null) {
                organization.setRegisteredCapital(new BigDecimal(data.getRegisteredCapital()));
            }
            organization.setEmployeeCount(data.getEmployeeCount());
            organization.setBusinessScope(data.getBusinessScope());
            if (data.getQualifications() != null) {
                organization.setQualifications(objectMapper.writeValueAsString(data.getQualifications()));
            }
            if (data.getProjects() != null) {
                organization.setProjects(objectMapper.writeValueAsString(data.getProjects()));
            }
            organization.setProvince(data.getProvince());
            organization.setCity(data.getCity());
            organization.setAddress(data.getAddress());
            organization.setWebsite(data.getWebsite());
            organization.setIntroduction(data.getIntroduction());

            organizationMemberRepository.save(organization);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse organization application data", e);
            throw new BusinessException("Failed to process organization member data");
        }
    }

    private String generateMemberNo(MemberType memberType) {
        String prefix = memberType == MemberType.INDIVIDUAL ? "P" : "O";
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return prefix + date + random;
    }

    private MemberApplicationResponse toResponse(MemberApplication application) {
        MemberApplicationResponse response = new MemberApplicationResponse();
        response.setId(application.getId());
        response.setMemberType(application.getMemberType());
        response.setUsername(application.getUsername());
        response.setEmail(application.getEmail());
        response.setPhone(application.getPhone());
        response.setStatus(application.getStatus());
        response.setApplicationData(application.getApplicationData());
        response.setReviewedBy(application.getReviewedBy());
        response.setReviewedAt(application.getReviewedAt());
        response.setRejectReason(application.getRejectReason());
        response.setMemberId(application.getMemberId());
        response.setCreatedTime(application.getCreatedTime());
        response.setUpdatedTime(application.getUpdatedTime());
        return response;
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
