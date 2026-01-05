package com.assoc.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.assoc.common.audit.ParameterMasker;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(AuditProperties.class)
public class AuditConfiguration {

    private final AuditProperties auditProperties;

    @Bean
    public ParameterMasker parameterMasker(ObjectMapper objectMapper) {
        return new ParameterMasker(
                objectMapper,
                auditProperties.getMaskKeys(),
                auditProperties.getParameterMaxLength()
        );
    }

    @Bean(name = "auditEventExecutor")
    public TaskExecutor auditEventExecutor() {
        AuditProperties.Async async = auditProperties.getAsync();
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix("audit-");
        executor.setCorePoolSize(async.getCorePoolSize());
        executor.setMaxPoolSize(async.getMaxPoolSize());
        executor.setQueueCapacity(async.getQueueCapacity());
        executor.initialize();
        return executor;
    }
}
