package com.assoc.ai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration to enable async processing for vectorization events.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Uses default Spring async executor
    // Can be customized with custom ThreadPoolTaskExecutor if needed
}
