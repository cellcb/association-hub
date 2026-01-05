package com.assoc.common.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Spring-based implementation of {@link NotificationPublisher}.
 *
 * This component bridges the high-level {@link NotificationRequest}
 * contract with Spring's application event mechanism so that the
 * notification module can subscribe to requests without the caller
 * needing a direct module dependency.
 */
@Component
@RequiredArgsConstructor
public class SpringNotificationPublisher implements NotificationPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publish(NotificationRequest request) {
        applicationEventPublisher.publishEvent(request);
    }
}

