package com.assoc.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ExpertRequest {
    @NotBlank(message = "姓名不能为空")
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

    private List<Long> expertiseFieldIds;

    // JSON string fields
    private String education;
    private String experience;
    private String projects;
    private String publications;
    private String awards;
    private String researchAreas;
}
