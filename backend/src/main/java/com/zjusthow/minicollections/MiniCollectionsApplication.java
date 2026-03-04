package com.zjusthow.minicollections;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MiniCollectionsApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiniCollectionsApplication.class, args);
    }

}
