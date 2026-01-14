package com.assoc.ai.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Slf4j
@Configuration
public class AiFlywayConfiguration {

    /**
     * AI module Flyway configuration bean
     * Provides configuration for multi-module Flyway migration strategy
     */
    @Bean("aiFlywayFluentConfiguration")
    @Order(10)
    @ConditionalOnMissingBean(name = "aiFlywayFluentConfiguration")
    public FluentConfiguration aiFlywayFluentConfiguration() {
        log.info("Creating AI Flyway Configuration:");
        log.info("  - Table: ai_flyway_schema_history");
        log.info("  - Locations: classpath:db/migration/ai");

        return Flyway.configure()
                .table("ai_flyway_schema_history")
                .locations("classpath:db/migration/ai")
                .baselineVersion("0")
                .baselineDescription("AI Module Baseline")
                .baselineOnMigrate(true)
                .validateOnMigrate(true)
                .outOfOrder(false)
                .group(false);
    }
}
