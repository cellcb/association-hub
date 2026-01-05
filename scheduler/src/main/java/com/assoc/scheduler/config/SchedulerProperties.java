package com.assoc.scheduler.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Scheduler module configuration.
 */
@Data
@ConfigurationProperties(prefix = "scheduler")
public class SchedulerProperties {

    private Retry retry = new Retry();

    @Data
    public static class Retry {
        /**
         * Maximum retry attempts after a failed execution.
         */
        private int maxAttempts = 3;

        /**
         * Interval between retries.
         */
        private Duration interval = Duration.ofMinutes(1);
    }
}
