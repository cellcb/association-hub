package com.assoc.activity.dto;

import com.assoc.activity.entity.RegistrationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RegistrationResponse {
    private Long id;
    private Long activityId;
    private String activityTitle;
    private Long userId;
    private String name;
    private String phone;
    private String email;
    private String company;
    private String position;
    private String memberType;
    private Long memberId;
    private Boolean isMemberRegistration;
    private String specialRequirements;
    private RegistrationStatus status;
    private String statusName;
    private LocalDateTime createdTime;
}
