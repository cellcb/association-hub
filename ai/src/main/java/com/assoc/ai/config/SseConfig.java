package com.assoc.ai.config;

import org.springframework.context.annotation.Configuration;

/**
 * SSE (Server-Sent Events) configuration.
 *
 * UTF-8 encoding is configured via server.servlet.encoding in application.yml.
 * Spring Boot's HttpEncodingAutoConfiguration handles the CharacterEncodingFilter.
 */
@Configuration
public class SseConfig {
    // UTF-8 encoding is handled by Spring Boot's auto-configuration
    // See application.yml: server.servlet.encoding.*
}
