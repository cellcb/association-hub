package com.assoc.activity.dto;

import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ActivityRequest {
    @NotBlank(message = "活动标题不能为空")
    @Size(max = 200, message = "活动标题不能超过200个字符")
    private String title;

    @NotNull(message = "活动类型不能为空")
    private ActivityType type;

    private LocalDate date;
    private LocalTime time;
    private LocalDate endDate;
    private LocalTime endTime;
    private LocalDate registrationStartDate;
    private LocalTime registrationStartTime;
    private LocalDate registrationEndDate;
    private LocalTime registrationEndTime;

    @Size(max = 200, message = "活动地点不能超过200个字符")
    private String location;
    private Integer participantsLimit;
    private ActivityStatus status;
    private String description;
    private String detailedDescription;

    @Size(max = 100, message = "主讲人姓名不能超过100个字符")
    private String speaker;
    private String speakerBio;

    @Size(max = 200, message = "主办单位名称不能超过200个字符")
    private String organization;
    private BigDecimal fee;
    private Integer capacity;
    private String coverImage;

    // JSON string fields
    private String venue;
    private String contact;
    private String benefits;
    private String agenda;
}
