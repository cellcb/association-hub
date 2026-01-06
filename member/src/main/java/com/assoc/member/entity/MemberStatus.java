package com.assoc.member.entity;

/**
 * Member status enumeration
 */
public enum MemberStatus {
    /**
     * Active member
     */
    ACTIVE("active", "有效"),

    /**
     * Expired member
     */
    EXPIRED("expired", "已过期"),

    /**
     * Suspended member
     */
    SUSPENDED("suspended", "已暂停");

    private final String code;
    private final String description;

    MemberStatus(String code, String description) {
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
