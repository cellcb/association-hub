package com.assoc.common.audit;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Standardized audit action codes to avoid string drift across modules.
 */
@Getter
@RequiredArgsConstructor
public enum AuditAction {
    UNKNOWN("unknown"),
    LOGIN("login"),
    LOGIN_FAILED("login_failed"),
    LOGOUT("logout"),
    CREATE_USER("create_user"),
    UPDATE_USER("update_user"),
    DELETE_USER("delete_user"),
    CREATE_ROLE("create_role"),
    UPDATE_ROLE("update_role"),
    DELETE_ROLE("delete_role"),
    CREATE_TENANT("create_tenant"),
    UPDATE_TENANT("update_tenant"),
    DELETE_TENANT("delete_tenant"),
    CREATE_RESOURCE("create_resource"),
    UPDATE_RESOURCE("update_resource"),
    DELETE_RESOURCE("delete_resource"),
    ACCESS("access");

    private final String code;
}
