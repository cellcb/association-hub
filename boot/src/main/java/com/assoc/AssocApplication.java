package com.assoc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AssocApplication {

    public static void main(String[] args) {
        SpringApplication.run(AssocApplication.class, args);
    }
}

