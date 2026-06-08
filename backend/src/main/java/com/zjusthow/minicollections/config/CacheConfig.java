package com.zjusthow.minicollections.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager() {
            @Override
            protected com.github.benmanes.caffeine.cache.Cache<Object, Object> createNativeCaffeineCache(
                    String name) {
                return cacheSpecFor(name).build();
            }
        };
        manager.setCacheNames(List.of("users", "userDetails", "brands", "brandObjects", "groups"));
        return manager;
    }

    private static Caffeine<Object, Object> cacheSpecFor(String name) {
        return switch (name) {
            case "users" -> Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofMinutes(1))
                    .maximumSize(200);
            case "userDetails" -> Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofMinutes(1))
                    .maximumSize(500);
            case "groups" -> Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofMinutes(1))
                    .maximumSize(500);
            case "brands", "brandObjects" -> Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(2000);
            default -> Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofMinutes(1))
                    .maximumSize(500);
        };
    }
}
