package com.assoc.cms.entity;

/**
 * Project category enumeration
 */
public enum ProjectCategory {
    /**
     * Smart building
     */
    SMART_BUILDING("smart_building", "智能建筑"),

    /**
     * Green building
     */
    GREEN_BUILDING("green_building", "绿色建筑"),

    /**
     * BIM application
     */
    BIM_APPLICATION("bim_application", "BIM应用"),

    /**
     * Prefabricated building
     */
    PREFABRICATED("prefabricated", "装配式建筑"),

    /**
     * Building renovation
     */
    RENOVATION("renovation", "既有建筑改造");

    private final String code;
    private final String description;

    ProjectCategory(String code, String description) {
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
