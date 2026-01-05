package com.assoc.iam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;

/**
 * 测试应用程序入口
 * 用于集成测试的Spring Boot配置
 * 排除Flyway自动配置以避免测试环境冲突
 */
@SpringBootApplication(exclude = {FlywayAutoConfiguration.class})
public class TestApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}
