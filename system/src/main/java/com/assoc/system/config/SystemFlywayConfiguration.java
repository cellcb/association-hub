package com.assoc.system.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class SystemFlywayConfiguration {

    /**
     * System模块的Flyway配置Bean
     * 为多模块Flyway迁移策略提供配置
     */
    @Bean("systemFlywayFluentConfiguration")
    @Order(7)
    @ConditionalOnMissingBean(name = "systemFlywayFluentConfiguration")
    public FluentConfiguration systemFlywayFluentConfiguration() {
        log.info("Creating System Flyway Configuration:");
        log.info("  - Table: sys_flyway_schema_history");
        log.info("  - Locations: classpath:db/migration/system");

        return Flyway.configure()
                .table("sys_flyway_schema_history")  // System模块专用的版本历史表
                .locations("classpath:db/migration/system")  // System模块专用的迁移脚本目录
                .baselineVersion("0")
                .baselineDescription("System Module Baseline")
                .baselineOnMigrate(true)  // 如果没有版本历史表则创建baseline
                .validateOnMigrate(true)  // 验证迁移脚本
                .outOfOrder(false)  // 不允许乱序执行
                .group(false);  // 不分组执行，确保事务隔离
    }
}
