package com.assoc.member.dto;

import lombok.Data;

/**
 * DTO for providing member information for activity registration auto-fill
 */
@Data
public class MemberRegistrationProfileResponse {
    private Long memberId;
    private String memberNo;
    private String memberType;  // INDIVIDUAL or ORGANIZATION
    private String memberStatus;
    private String name;
    private String phone;
    private String email;
    private String company;
    private String position;
}
