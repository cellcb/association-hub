package com.assoc.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Individual member update request DTO
 */
@Data
public class IndividualMemberUpdateRequest {

    @Size(max = 50, message = "Name must be at most 50 characters")
    private String name;

    @Size(max = 10, message = "Gender must be at most 10 characters")
    private String gender;

    @Size(max = 20, message = "ID card must be at most 20 characters")
    private String idCard;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be at most 100 characters")
    private String email;

    @Size(max = 200, message = "Organization must be at most 200 characters")
    private String organization;

    @Size(max = 100, message = "Position must be at most 100 characters")
    private String position;

    @Size(max = 100, message = "Title must be at most 100 characters")
    private String title;

    private String expertise;

    @Size(max = 50, message = "Province must be at most 50 characters")
    private String province;

    @Size(max = 50, message = "City must be at most 50 characters")
    private String city;

    @Size(max = 300, message = "Address must be at most 300 characters")
    private String address;

    @Size(max = 50, message = "Education must be at most 50 characters")
    private String education;

    @Size(max = 50, message = "Experience must be at most 50 characters")
    private String experience;

    private String achievements;

    @Size(max = 500, message = "Recommendation must be at most 500 characters")
    private String recommendation;

    @Size(max = 500, message = "Avatar URL must be at most 500 characters")
    private String avatar;
}
