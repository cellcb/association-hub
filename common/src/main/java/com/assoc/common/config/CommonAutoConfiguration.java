package com.assoc.common.config;

import com.assoc.common.context.RequestContext;
import com.assoc.common.context.ThreadLocalRequestContext;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

/**
 * Common模块自动配置类
 * 确保异常处理器等组件被正确注册
 */
@AutoConfiguration
@ComponentScan(basePackages = "com.assoc.common")
public class CommonAutoConfiguration {

    @Bean
    public RequestContext requestContext() {
        return new ThreadLocalRequestContext();
    }
}
