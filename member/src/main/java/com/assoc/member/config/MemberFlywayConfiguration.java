package com.assoc.member.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Slf4j
@Configuration
public class MemberFlywayConfiguration {

    /**
     * Member module Flyway configuration bean
     * Provides configuration for multi-module Flyway migration strategy
     */
    @Bean("memberFlywayFluentConfiguration")
    @Order(2)
    @ConditionalOnMissingBean(name = "memberFlywayFluentConfiguration")
    public FluentConfiguration memberFlywayFluentConfiguration() {
        log.info("Creating Member Flyway Configuration:");
        log.info("  - Table: mbr_flyway_schema_history");
        log.info("  - Locations: classpath:db/migration/member");

        return Flyway.configure()
                .table("mbr_flyway_schema_history")
                .locations("classpath:db/migration/member")
                .baselineVersion("0")
                .baselineDescription("Member Module Baseline")
                .baselineOnMigrate(true)
                .validateOnMigrate(true)
                .outOfOrder(false)
                .group(false);
    }
}
