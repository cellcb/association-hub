package com.assoc.activity.dto;

import com.assoc.activity.entity.ActivityStatus;
import com.assoc.activity.entity.ActivityType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ActivityListResponse {
    private Long id;
    private String title;
    private ActivityType type;
    private String typeName;
    private LocalDate date;
    private LocalTime time;
    private LocalDate registrationEndDate;
    private LocalTime registrationEndTime;
    private String location;
    private ActivityStatus status;
    private String statusName;
    private String description;
    private String organization;
    private BigDecimal fee;
    private Integer capacity;
    private Integer registeredCount;
    private String coverImage;
}
