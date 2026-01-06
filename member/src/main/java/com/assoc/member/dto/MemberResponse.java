package com.assoc.member.dto;

import com.assoc.member.entity.MemberStatus;
import com.assoc.member.entity.MemberType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Member response DTO
 */
@Data
public class MemberResponse {

    private Long id;
    private Long userId;
    private String memberNo;
    private MemberType memberType;
    private String memberTypeDescription;
    private MemberStatus status;
    private String statusDescription;
    private LocalDateTime approvedAt;
    private LocalDateTime expiredAt;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    /**
     * Display name (individual name or organization name)
     */
    private String displayName;

    /**
     * Individual member details (for INDIVIDUAL type)
     */
    private IndividualMemberResponse individualMember;

    /**
     * Organization member details (for ORGANIZATION type)
     */
    private OrganizationMemberResponse organizationMember;

    /**
     * Individual member response DTO
     */
    @Data
    public static class IndividualMemberResponse {
        private Long id;
        private String name;
        private String gender;
        private String idCard;
        private String phone;
        private String email;
        private String organization;
        private String position;
        private String title;
        private String expertise;
        private String province;
        private String city;
        private String address;
        private String education;
        private String experience;
        private String achievements;
        private String recommendation;
        private String avatar;
    }

    /**
     * Organization member response DTO
     */
    @Data
    public static class OrganizationMemberResponse {
        private Long id;
        private String orgName;
        private String orgType;
        private String orgTypeDescription;
        private String socialCreditCode;
        private String legalRepresentative;
        private String contactPerson;
        private String contactPhone;
        private String contactEmail;
        private String establishmentDate;
        private String registeredCapital;
        private Integer employeeCount;
        private String businessScope;
        private String qualifications;
        private String projects;
        private String province;
        private String city;
        private String address;
        private String website;
        private String introduction;
        private String logo;
    }
}
