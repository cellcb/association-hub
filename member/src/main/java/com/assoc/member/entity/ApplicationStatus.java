package com.assoc.member.entity;

/**
 * Member application status enumeration
 */
public enum ApplicationStatus {
    /**
     * Pending review
     */
    PENDING("pending", "待审核"),

    /**
     * Approved
     */
    APPROVED("approved", "已通过"),

    /**
     * Rejected
     */
    REJECTED("rejected", "已拒绝");

    private final String code;
    private final String description;

    ApplicationStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
