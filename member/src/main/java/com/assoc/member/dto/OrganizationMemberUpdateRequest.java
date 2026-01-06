package com.assoc.member.dto;

import com.assoc.member.entity.OrganizationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Organization member update request DTO
 */
@Data
public class OrganizationMemberUpdateRequest {

    @Size(max = 200, message = "Organization name must be at most 200 characters")
    private String orgName;

    private OrganizationType orgType;

    @Size(max = 30, message = "Social credit code must be at most 30 characters")
    private String socialCreditCode;

    @Size(max = 50, message = "Legal representative must be at most 50 characters")
    private String legalRepresentative;

    @Size(max = 50, message = "Contact person must be at most 50 characters")
    private String contactPerson;

    @Size(max = 20, message = "Contact phone must be at most 20 characters")
    private String contactPhone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Contact email must be at most 100 characters")
    private String contactEmail;

    private LocalDate establishmentDate;

    private BigDecimal registeredCapital;

    private Integer employeeCount;

    private String businessScope;

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

    private String introduction;

    @Size(max = 500, message = "Logo URL must be at most 500 characters")
    private String logo;
}
