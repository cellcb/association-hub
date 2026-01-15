package com.assoc.cms.entity;

import com.assoc.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "mfr_manufacturer")
@EqualsAndHashCode(callSuper = true)
public class Manufacturer extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ManufacturerCategory category;

    @Column(columnDefinition = "TEXT")
    private String logo;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(length = 500)
    private String address;

    private String website;

    @Column(name = "established_date")
    private LocalDate establishedDate;

    @Column(name = "registered_capital", length = 100)
    private String registeredCapital;

    @Column(name = "employee_scale", length = 50)
    private String employeeScale;

    @Column(name = "main_business", columnDefinition = "TEXT")
    private String mainBusiness;

    @Column(columnDefinition = "TEXT")
    private String qualifications;

    @Column(columnDefinition = "TEXT")
    private String honors;

    @Column(name = "cases", columnDefinition = "TEXT")
    private String cases;

    @Column(columnDefinition = "TEXT")
    private String images;

    private Integer status = 0;

    private Boolean featured = false;

    private Long views = 0L;

    public void incrementViews() {
        this.views = (this.views == null ? 0L : this.views) + 1;
    }

    public boolean isPublished() {
        return this.status != null && this.status == 1;
    }
}
