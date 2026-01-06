package com.assoc.cms.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Slf4j
@Configuration
public class CmsFlywayConfiguration {

    /**
     * CMS module Flyway configuration bean
     * Provides configuration for multi-module Flyway migration strategy
     */
    @Bean("cmsFlywayFluentConfiguration")
    @Order(3)
    @ConditionalOnMissingBean(name = "cmsFlywayFluentConfiguration")
    public FluentConfiguration cmsFlywayFluentConfiguration() {
        log.info("Creating CMS Flyway Configuration:");
        log.info("  - Table: cms_flyway_schema_history");
        log.info("  - Locations: classpath:db/migration/cms");

        return Flyway.configure()
                .table("cms_flyway_schema_history")
                .locations("classpath:db/migration/cms")
                .baselineVersion("0")
                .baselineDescription("CMS Module Baseline")
                .baselineOnMigrate(true)
                .validateOnMigrate(true)
                .outOfOrder(false)
                .group(false);
    }
}
