package com.mediaflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MediaFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediaFlowApplication.class, args);
    }
}
