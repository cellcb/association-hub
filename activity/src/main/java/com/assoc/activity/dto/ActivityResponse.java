package com.assoc.activity.dto;

import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class ActivityResponse {
    private Long id;
    private String title;
    private ActivityType type;
    private String typeName;
    private LocalDate date;
    private LocalTime time;
    private LocalDate endDate;
    private LocalTime endTime;
    private String location;
    private Integer participantsLimit;
    private ActivityStatus status;
    private String statusName;
    private String description;
    private String detailedDescription;
    private String speaker;
    private String speakerBio;
    private String organization;
    private BigDecimal fee;
    private Integer capacity;
    private Integer registeredCount;
    private String coverImage;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    // JSON string fields
    private String venue;
    private String contact;
    private String benefits;
    private String agenda;
}
