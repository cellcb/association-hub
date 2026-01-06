package com.assoc.cms.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExpertResponse {
    private Long id;
    private String name;
    private String title;
    private String organization;
    private String location;
    private String achievements;
    private String email;
    private String phone;
    private String avatar;
    private String bio;
    private Integer status;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    private List<ExpertiseFieldResponse> expertiseFields;

    // JSON string fields
    private String education;
    private String experience;
    private String projects;
    private String publications;
    private String awards;
    private String researchAreas;
}
