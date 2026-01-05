package com.assoc.iam.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class IamFlywayConfiguration {
    
    /**
     * IAM模块的Flyway配置Bean
     * 为多模块Flyway迁移策略提供配置
     */
    @Bean("iamFlywayFluentConfiguration")
    @Order(1)
    @ConditionalOnMissingBean(name = "iamFlywayFluentConfiguration")
    public FluentConfiguration iamFlywayFluentConfiguration() {
        log.info("Creating IAM Flyway Configuration:");
        log.info("  - Table: iam_flyway_schema_history");
        log.info("  - Locations: classpath:db/migration/iam");
        
        return Flyway.configure()
                .table("iam_flyway_schema_history")  // IAM模块专用的版本历史表
                .locations("classpath:db/migration/iam")  // IAM模块专用的迁移脚本目录
                .baselineVersion("0")
                .baselineDescription("IAM Module Baseline")
                .baselineOnMigrate(true)  // 如果没有版本历史表则创建baseline
                .validateOnMigrate(true)  // 验证迁移脚本
                .outOfOrder(false)  // 不允许乱序执行
                .group(false);  // 不分组执行，确保事务隔离
    }
}
