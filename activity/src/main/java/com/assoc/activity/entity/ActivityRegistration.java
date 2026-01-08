package com.assoc.activity.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "act_registration")
@Getter
@Setter
public class ActivityRegistration extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_id", nullable = false)
    private Long activityId;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String email;

    private String company;

    private String position;

    @Column(name = "member_type")
    private String memberType;

    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "is_member_registration")
    private Boolean isMemberRegistration = false;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegistrationStatus status = RegistrationStatus.PENDING;
}
