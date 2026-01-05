package com.assoc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WaterPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(WaterPlatformApplication.class, args);
    }
}

