package com.assoc.activity.dto;

import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ActivityRequest {
    @NotBlank(message = "活动标题不能为空")
    private String title;

    @NotNull(message = "活动类型不能为空")
    private ActivityType type;

    private LocalDate date;
    private LocalTime time;
    private LocalDate endDate;
    private LocalTime endTime;
    private String location;
    private Integer participantsLimit;
    private ActivityStatus status;
    private String description;
    private String detailedDescription;
    private String speaker;
    private String speakerBio;
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
