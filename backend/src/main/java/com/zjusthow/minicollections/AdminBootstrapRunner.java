package com.zjusthow.minicollections;

import com.zjusthow.minicollections.config.BootstrapProperties;
import com.zjusthow.minicollections.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@EnableConfigurationProperties(BootstrapProperties.class)
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserService userService;
    private final BootstrapProperties bootstrapProperties;

    public AdminBootstrapRunner(UserService userService, BootstrapProperties bootstrapProperties) {
        this.userService = userService;
        this.bootstrapProperties = bootstrapProperties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userService.hasAnyAdmin()) {
            return;
        }

        String email = bootstrapProperties.adminEmail();
        if (email == null || email.isBlank()) {
            log.warn(
                    "No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin on startup.");
            return;
        }

        boolean created = userService.tryBootstrapAdmin(
                email,
                bootstrapProperties.adminPassword(),
                bootstrapProperties.adminName(),
                bootstrapProperties.adminLocale());

        if (created) {
            log.info("Bootstrap admin ensured for {}", maskEmail(email.strip()));
            return;
        }

        log.warn(
                "No admin account exists and bootstrap did not run. "
                        + "If {} is not registered yet, set ADMIN_PASSWORD; otherwise check logs for errors.",
                maskEmail(email.strip()));
    }

    private static String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}
