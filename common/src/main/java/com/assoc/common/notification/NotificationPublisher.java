package com.assoc.common.notification;

/**
 * Abstraction for publishing notification requests as application events.
 *
 * Business modules depend on this interface to trigger notifications
 * without coupling to the notification module itself.
 */
public interface NotificationPublisher {

    /**
     * Publish a notification request for asynchronous processing.
     *
     * @param request structured notification request payload
     */
    void publish(NotificationRequest request);
}

