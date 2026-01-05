package com.assoc.common.notification;

import lombok.Data;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * High-level notification request / event payload.
 *
 * This object is published as a Spring application event and consumed
 * by the notification module. It intentionally lives in the {@code common}
 * module so that other business modules can depend only on this contract
 * rather than the concrete notification implementation.
 */
@Data
public class NotificationRequest {

    /**
     * Logical source module of the event (e.g. "facility", "rule").
     */
    private String sourceModule;

    /**
     * Business type identifier (string code, e.g. "facility.alarm.high").
     */
    private String bizType;

    /**
     * Business object identifier (string to support flexible formats).
     */
    private String bizObjectId;

    /**
     * Template code to be used for rendering the message.
     */
    private String templateCode;

    /**
     * Template parameters, usually rendered into title/content by the notification module.
     */
    private Map<String, Object> templateParams = Collections.emptyMap();

    /**
     * Platform user IDs that should receive in-app notifications.
     *
     * Resolution of user IDs to actual contact addresses (for SMS/email/WeChat)
     * is intentionally left outside of this contract so that the notification
     * module remains loosely coupled to the IAM module. Callers who also want
     * to send external messages should additionally populate {@link #directRecipients}.
     */
    private List<Long> userIds = Collections.emptyList();

    /**
     * Direct recipients that carry delivery addresses (phone/email/WeChat).
     */
    private List<DirectRecipient> directRecipients = Collections.emptyList();

    /**
     * Target channels for this notification (e.g. EMAIL, SMS, WECHAT, IN_APP).
     */
    private Set<NotificationChannel> channels = Collections.emptySet();
}

