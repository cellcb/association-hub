package com.assoc.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "audit")
public class AuditProperties {

    /**
     * Keys that should be masked when logging parameters.
     */
    private List<String> maskKeys = new ArrayList<>(List.of(
            "password", "secret", "token", "access_token", "refresh_token",
            "authorization", "api_key", "apikey", "client_secret",
            "oldPassword", "newPassword", "confirmPassword", "credential"
    ));

    /**
     * Maximum length for serialized parameters payload.
     */
    private int parameterMaxLength = 4000;

    /**
     * How many days to retain audit data. Set to 0 or negative to disable purging.
     */
    private int retentionDays = 180;

    /**
     * Cron expression for retention cleanup.
     */
    private String retentionCron = "0 30 3 * * *";

    private Async async = new Async();

    @Data
    public static class Async {
        private int corePoolSize = 2;
        private int maxPoolSize = 4;
        private int queueCapacity = 500;
    }
}
