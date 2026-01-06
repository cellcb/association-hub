package com.assoc.activity.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Slf4j
@Configuration
public class ActivityFlywayConfiguration {

    @Bean("activityFlywayFluentConfiguration")
    @Order(4)
    public FluentConfiguration activityFlywayFluentConfiguration() {
        log.info("Creating Activity Flyway Configuration:");
        log.info("  - Table: act_flyway_schema_history");
        log.info("  - Locations: classpath:db/migration/activity");

        return Flyway.configure()
                .table("act_flyway_schema_history")
                .locations("classpath:db/migration/activity")
                .baselineVersion("0")
                .baselineDescription("Activity Module Baseline")
                .baselineOnMigrate(true)
                .validateOnMigrate(true);
    }
}
