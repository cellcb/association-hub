package com.assoc.activity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegistrationRequest {
    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "手机号不能为空")
    private String phone;

    private String email;
    private String company;
    private String position;
    private String memberType;
    private Long memberId;
    private String specialRequirements;
}
