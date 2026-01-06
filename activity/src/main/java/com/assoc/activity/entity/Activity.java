package com.assoc.activity.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "act_activity")
@Getter
@Setter
public class Activity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityType type;

    @Column(name = "activity_date")
    private LocalDate date;

    @Column(name = "activity_time")
    private LocalTime time;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "end_time")
    private LocalTime endTime;

    private String location;

    @Column(name = "participants_limit")
    private Integer participantsLimit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityStatus status = ActivityStatus.UPCOMING;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "detailed_description", columnDefinition = "TEXT")
    private String detailedDescription;

    private String speaker;

    @Column(name = "speaker_bio", columnDefinition = "TEXT")
    private String speakerBio;

    private String organization;

    @Column(precision = 10, scale = 2)
    private BigDecimal fee;

    private Integer capacity;

    @Column(name = "registered_count")
    private Integer registeredCount = 0;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(columnDefinition = "TEXT")
    private String venue;

    @Column(columnDefinition = "TEXT")
    private String contact;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String agenda;
}
