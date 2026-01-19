package com.assoc.member.dto;

import com.assoc.member.entity.MemberType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Member application request DTO
 */
@Data
public class MemberApplicationRequest {

    @NotNull(message = "Member type is required")
    private MemberType memberType;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    /**
     * Individual member application data (for INDIVIDUAL type)
     */
    @Valid
    private IndividualApplicationData individualData;

    /**
     * Organization member application data (for ORGANIZATION type)
     */
    @Valid
    private OrganizationApplicationData organizationData;

    /**
     * Individual member application data
     */
    @Data
    public static class IndividualApplicationData {
        @NotBlank(message = "Name is required")
        @Size(max = 50, message = "Name must be at most 50 characters")
        private String name;

        @Size(max = 10, message = "Gender must be at most 10 characters")
        private String gender;

        @Size(max = 20, message = "ID card must be at most 20 characters")
        @Pattern(regexp = "^$|^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$",
                message = "Invalid ID card format")
        private String idCard;

        @Size(max = 200, message = "Organization must be at most 200 characters")
        private String organization;

        @Size(max = 100, message = "Position must be at most 100 characters")
        private String position;

        @Size(max = 100, message = "Title must be at most 100 characters")
        private String title;

        private String[] expertise;

        @Size(max = 50, message = "Province must be at most 50 characters")
        private String province;

        @Size(max = 50, message = "City must be at most 50 characters")
        private String city;

        @Size(max = 300, message = "Address must be at most 300 characters")
        private String address;

        @Size(max = 50, message = "Education must be at most 50 characters")
        private String education;

        @Size(max = 500, message = "Experience must be at most 500 characters")
        private String experience;

        private String achievements; // TEXT type, no length limit

        @Size(max = 500, message = "Recommendation must be at most 500 characters")
        private String recommendation;
    }

    /**
     * Organization member application data
     */
    @Data
    public static class OrganizationApplicationData {
        @NotBlank(message = "Organization name is required")
        @Size(max = 200, message = "Organization name must be at most 200 characters")
        private String orgName;

        @NotNull(message = "Organization type is required")
        @Size(max = 20, message = "Organization type must be at most 20 characters")
        private String orgType;

        @Size(max = 30, message = "Social credit code must be at most 30 characters")
        @Pattern(regexp = "^$|^[0-9A-HJ-NPQRTUWXY]{2}\\d{6}[0-9A-HJ-NPQRTUWXY]{10}$",
                message = "Invalid social credit code format")
        private String socialCreditCode;

        @Size(max = 50, message = "Legal representative must be at most 50 characters")
        private String legalRepresentative;

        @Size(max = 50, message = "Contact person must be at most 50 characters")
        private String contactPerson;

        @Size(max = 20, message = "Contact phone must be at most 20 characters")
        @Pattern(regexp = "^$|^1[3-9]\\d{9}$|^\\d{3,4}-\\d{7,8}$",
                message = "Invalid phone format")
        private String contactPhone;

        @Email(message = "Invalid email format")
        @Size(max = 100, message = "Contact email must be at most 100 characters")
        private String contactEmail;

        private String establishmentDate;

        @Pattern(regexp = "^$|^\\d+(\\.\\d{1,2})?$", message = "Invalid registered capital format")
        private String registeredCapital;

        @Min(value = 0, message = "Employee count must be non-negative")
        private Integer employeeCount;

        private String businessScope; // TEXT type

        private String[] qualifications;

        private String[] projects;

        @Size(max = 50, message = "Province must be at most 50 characters")
        private String province;

        @Size(max = 50, message = "City must be at most 50 characters")
        private String city;

        @Size(max = 300, message = "Address must be at most 300 characters")
        private String address;

        @Size(max = 200, message = "Website must be at most 200 characters")
        private String website;

        private String introduction; // TEXT type
    }
}
