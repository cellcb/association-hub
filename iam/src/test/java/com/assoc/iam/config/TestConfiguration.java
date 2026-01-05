package com.assoc.iam.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * 测试环境专用配置
 * 禁用Flyway相关的自动配置，避免与测试环境冲突
 */
@Configuration
@Profile({"test", "integration"})
@EnableAutoConfiguration(exclude = {FlywayAutoConfiguration.class})
public class TestConfiguration {
    // 测试环境专用配置
}
