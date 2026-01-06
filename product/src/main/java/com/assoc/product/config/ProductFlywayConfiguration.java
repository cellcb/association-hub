package com.assoc.product.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Slf4j
@Configuration
public class ProductFlywayConfiguration {

    @Bean("productFlywayFluentConfiguration")
    @Order(5)
    public FluentConfiguration productFlywayFluentConfiguration() {
        log.info("Creating Product Flyway Configuration:");
        log.info("  - Table: prd_flyway_schema_history");
        log.info("  - Locations: classpath:db/migration/product");

        return Flyway.configure()
                .table("prd_flyway_schema_history")
                .locations("classpath:db/migration/product")
                .baselineVersion("0")
                .baselineDescription("Product Module Baseline")
                .baselineOnMigrate(true)
                .validateOnMigrate(true);
    }
}
