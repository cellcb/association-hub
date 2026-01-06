package com.assoc.member.entity;

/**
 * Member type enumeration
 */
public enum MemberType {
    /**
     * Individual member
     */
    INDIVIDUAL("individual", "个人会员"),

    /**
     * Organization member
     */
    ORGANIZATION("organization", "单位会员");

    private final String code;
    private final String description;

    MemberType(String code, String description) {
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
