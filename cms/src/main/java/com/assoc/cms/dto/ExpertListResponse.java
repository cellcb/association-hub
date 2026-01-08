package com.assoc.cms.dto;

import lombok.Data;

import java.util.List;

@Data
public class ExpertListResponse {
    private Long id;
    private String name;
    private String title;
    private String organization;
    private String location;
    private String avatar;
    private Integer status;
    private List<ExpertiseFieldResponse> expertiseFields;

    // 新增字段用于卡片展示
    private String achievements;
    private String email;
    private String phone;
}
