package com.assoc.common.notification;

/**
 * Supported notification delivery channels.
 *
 * This enum is intentionally small and stable so that business
 * services can depend on it without needing to know about the
 * internal implementation of the notification module.
 */
public enum NotificationChannel {

    /**
     * Email notifications.
     */
    EMAIL,

    /**
     * SMS (short message) notifications.
     */
    SMS,

    /**
     * WeChat notifications (exact integration to be decided later).
     */
    WECHAT,

    /**
     * In-application (inbox / system) notifications.
     */
    IN_APP
}

