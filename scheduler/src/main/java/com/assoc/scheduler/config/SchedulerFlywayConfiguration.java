package com.assoc.scheduler.config;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * Registers Flyway configuration for the scheduler module so migrations
 * under db/migration/scheduler run automatically.
 */
@Slf4j
@Configuration
@EnableConfigurationProperties(SchedulerFlywayConfiguration.SchedulerFlywayProperties.class)
@ConditionalOnProperty(prefix = "modules.flyway.scheduler", name = "enabled", havingValue = "true", matchIfMissing = true)
public class SchedulerFlywayConfiguration {

    private final SchedulerFlywayProperties properties;

    public SchedulerFlywayConfiguration(SchedulerFlywayProperties properties) {
        this.properties = properties;
    }

    @Bean("schedulerFlywayFluentConfiguration")
    @Order(20)
    public FluentConfiguration schedulerFlywayFluentConfiguration() {
        log.info("Registering scheduler Flyway migrations from {} using history table {}",
                properties.getLocations(), properties.getTable());
        return Flyway.configure()
                .table(properties.getTable())
                .locations(properties.getLocations())
                .baselineVersion(properties.getBaselineVersion())
                .baselineDescription(properties.getBaselineDescription())
                .baselineOnMigrate(true);
    }

    @Getter
    @Setter
    @ConfigurationProperties(prefix = "modules.flyway.scheduler")
    public static class SchedulerFlywayProperties {
        /**
         * Whether scheduler migrations are enabled. Binding requires the field even though the
         * conditional already checks the property.
         */
        private boolean enabled = true;
        private String table = "sch_flyway_schema_history";
        private String locations = "classpath:db/migration/scheduler";
        private String baselineVersion = "0";
        private String baselineDescription = "Scheduler Module Baseline";
    }
}
