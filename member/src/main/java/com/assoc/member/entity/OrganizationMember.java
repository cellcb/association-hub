package com.assoc.member.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Organization member details entity
 */
@Data
@Entity
@Table(name = "mbr_organization_member")
@EqualsAndHashCode(exclude = {"member"}, callSuper = true)
@ToString(exclude = {"member"}, callSuper = true)
public class OrganizationMember extends AuditableEntity {

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
     * Organization name
     */
    @Column(name = "org_name", nullable = false, length = 200)
    private String orgName;

    /**
     * Organization type
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "org_type", nullable = false, length = 20)
    private OrganizationType orgType;

    /**
     * Unified Social Credit Code
     */
    @Column(name = "social_credit_code", length = 30)
    private String socialCreditCode;

    /**
     * Legal representative
     */
    @Column(name = "legal_representative", length = 50)
    private String legalRepresentative;

    /**
     * Contact person
     */
    @Column(name = "contact_person", length = 50)
    private String contactPerson;

    /**
     * Contact phone
     */
    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    /**
     * Contact email
     */
    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    /**
     * Establishment date
     */
    @Column(name = "establishment_date")
    private LocalDate establishmentDate;

    /**
     * Registered capital
     */
    @Column(name = "registered_capital", precision = 18, scale = 2)
    private BigDecimal registeredCapital;

    /**
     * Employee count
     */
    @Column(name = "employee_count")
    private Integer employeeCount;

    /**
     * Business scope
     */
    @Column(name = "business_scope", columnDefinition = "TEXT")
    private String businessScope;

    /**
     * Qualifications (JSON array)
     */
    @Column(name = "qualifications", columnDefinition = "TEXT")
    private String qualifications;

    /**
     * Project experience (JSON array)
     */
    @Column(name = "projects", columnDefinition = "TEXT")
    private String projects;

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
     * Website
     */
    @Column(name = "website", length = 200)
    private String website;

    /**
     * Introduction
     */
    @Column(name = "introduction", columnDefinition = "TEXT")
    private String introduction;

    /**
     * Logo URL
     */
    @Column(name = "logo", length = 500)
    private String logo;

    /**
     * Get member ID
     */
    public Long getMemberId() {
        return member != null ? member.getId() : null;
    }
}
