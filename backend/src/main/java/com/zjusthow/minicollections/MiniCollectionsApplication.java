package com.zjusthow.minicollections;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@SpringBootApplication
@EnableCaching
@EnableElasticsearchRepositories(basePackageClasses = com.zjusthow.minicollections.elasticsearch.BrandObjectSearchRepository.class)
public class MiniCollectionsApplication {
    public static void main(String[] args) {
        SpringApplication.run(MiniCollectionsApplication.class, args);
    }
}