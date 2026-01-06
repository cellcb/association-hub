package com.assoc.member.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Individual member details entity
 */
@Data
@Entity
@Table(name = "mbr_individual_member")
@EqualsAndHashCode(exclude = {"member"}, callSuper = true)
@ToString(exclude = {"member"}, callSuper = true)
public class IndividualMember extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Associated member
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    /**
     * Real name
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * Gender
     */
    @Column(name = "gender", length = 10)
    private String gender;

    /**
     * ID card number
     */
    @Column(name = "id_card", length = 20)
    private String idCard;

    /**
     * Phone number
     */
    @Column(name = "phone", length = 20)
    private String phone;

    /**
     * Email address
     */
    @Column(name = "email", length = 100)
    private String email;

    /**
     * Work organization
     */
    @Column(name = "organization", length = 200)
    private String organization;

    /**
     * Position
     */
    @Column(name = "position", length = 100)
    private String position;

    /**
     * Professional title
     */
    @Column(name = "title", length = 100)
    private String title;

    /**
     * Expertise fields (JSON array)
     */
    @Column(name = "expertise", columnDefinition = "TEXT")
    private String expertise;

    /**
     * Province
     */
    @Column(name = "province", length = 50)
    private String province;

    /**
     * City
     */
    @Column(name = "city", length = 50)
    private String city;

    /**
     * Detailed address
     */
    @Column(name = "address", length = 300)
    private String address;

    /**
     * Education background
     */
    @Column(name = "education", length = 50)
    private String education;

    /**
     * Work experience (years)
     */
    @Column(name = "experience", length = 50)
    private String experience;

    /**
     * Main achievements
     */
    @Column(name = "achievements", columnDefinition = "TEXT")
    private String achievements;

    /**
     * Recommendation info
     */
    @Column(name = "recommendation", length = 500)
    private String recommendation;

    /**
     * Avatar URL
     */
    @Column(name = "avatar", length = 500)
    private String avatar;

    /**
     * Get member ID
     */
    public Long getMemberId() {
        return member != null ? member.getId() : null;
    }
}
