package com.assoc.member.entity;

/**
 * Organization member type enumeration
 */
public enum OrganizationType {
    /**
     * Equipment unit
     */
    EQUIPMENT("equipment", "设备单位"),

    /**
     * Construction unit
     */
    CONSTRUCTION("construction", "建设单位"),

    /**
     * Public institution
     */
    INSTITUTION("institution", "事业单位"),

    /**
     * Design unit
     */
    DESIGN("design", "设计单位"),

    /**
     * Other
     */
    OTHER("other", "其他");

    private final String code;
    private final String description;

    OrganizationType(String code, String description) {
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
