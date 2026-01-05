package com.assoc.iam.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * IAM 模块的 OpenAPI 分组配置。
 */
@Configuration
public class IamOpenApiConfig {

    @Bean
    public GroupedOpenApi iamApi() {
        return GroupedOpenApi.builder()
                .group("iam")
                .displayName("身份认证与权限管理")
                .packagesToScan("com.waterplatform.iam.controller")
                .build();
    }
}
