package com.assoc.member.dto;

import com.assoc.member.entity.MemberType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Member application request DTO
 */
@Data
public class MemberApplicationRequest {

    @NotNull(message = "Member type is required")
    private MemberType memberType;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    /**
     * Individual member application data (for INDIVIDUAL type)
     */
    private IndividualApplicationData individualData;

    /**
     * Organization member application data (for ORGANIZATION type)
     */
    private OrganizationApplicationData organizationData;

    /**
     * Individual member application data
     */
    @Data
    public static class IndividualApplicationData {
        @NotBlank(message = "Name is required")
        private String name;
        private String gender;
        private String idCard;
        private String organization;
        private String position;
        private String title;
        private String[] expertise;
        private String province;
        private String city;
        private String address;
        private String education;
        private String experience;
        private String achievements;
        private String recommendation;
    }

    /**
     * Organization member application data
     */
    @Data
    public static class OrganizationApplicationData {
        @NotBlank(message = "Organization name is required")
        private String orgName;
        @NotNull(message = "Organization type is required")
        private String orgType;
        private String socialCreditCode;
        private String legalRepresentative;
        private String contactPerson;
        private String contactPhone;
        private String contactEmail;
        private String establishmentDate;
        private String registeredCapital;
        private Integer employeeCount;
        private String businessScope;
        private String[] qualifications;
        private String[] projects;
        private String province;
        private String city;
        private String address;
        private String website;
        private String introduction;
    }
}
