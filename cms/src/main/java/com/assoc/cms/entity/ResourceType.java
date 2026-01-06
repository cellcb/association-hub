package com.assoc.cms.entity;

/**
 * Resource type for polymorphic associations (e.g., comments)
 */
public enum ResourceType {
    /**
     * News article
     */
    NEWS("news", "新闻"),

    /**
     * Project
     */
    PROJECT("project", "项目"),

    /**
     * Activity
     */
    ACTIVITY("activity", "活动");

    private final String code;
    private final String description;

    ResourceType(String code, String description) {
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
