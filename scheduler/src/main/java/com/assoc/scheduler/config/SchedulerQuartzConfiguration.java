package com.assoc.scheduler.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.quartz.SchedulerFactoryBeanCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures common Quartz settings for the scheduler module.
 */
@Configuration
@ConditionalOnProperty(prefix = "spring.quartz", name = "job-store-type", havingValue = "jdbc", matchIfMissing = false)
public class SchedulerQuartzConfiguration {

    @Bean
    public SchedulerFactoryBeanCustomizer schedulerFactoryBeanCustomizer() {
        return factory -> {
            factory.setOverwriteExistingJobs(true);
            factory.setWaitForJobsToCompleteOnShutdown(true);
            factory.setAutoStartup(true);
        };
    }
}
