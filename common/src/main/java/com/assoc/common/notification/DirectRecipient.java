package com.assoc.common.notification;

import lombok.Data;

/**
 * Direct recipient information for notifications.
 *
 * This models recipients that are not resolved via platform users.
 * Callers are expected to provide the actual delivery addresses
 * (phone, email, WeChat identifier, etc.).
 */
@Data
public class DirectRecipient {

    /**
     * Phone number for SMS delivery (optional).
     */
    private String phone;

    /**
     * Email address for email delivery (optional).
     */
    private String email;

    /**
     * WeChat identifier (openId or unionId depending on integration, optional).
     */
    private String wechatId;
}

