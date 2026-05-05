package com.zjusthow.minicollections;

import com.zjusthow.minicollections.entity.*;
import com.zjusthow.minicollections.repository.*;
import com.zjusthow.minicollections.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("dev")
public class DevRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DevRunner.class);

    private final BrandObjectRepository brandObjectRepository;
    private final BrandRepository brandRepository;
    private final GroupRepository groupRepository;
    private final UserObjectRepository userObjectRepository;
    private final UserService userService;

    public DevRunner(
            BrandObjectRepository brandObjectRepository,
            BrandRepository brandRepository,
            GroupRepository groupRepository,
            UserObjectRepository userObjectRepository,
            UserService userService
    ) {
        this.brandObjectRepository = brandObjectRepository;
        this.brandRepository = brandRepository;
        this.groupRepository = groupRepository;
        this.userObjectRepository = userObjectRepository;
        this.userService = userService;
    }

    @Override
    public void run(ApplicationArguments args) {
        Long testUserId = userService.signUp("admin@email.com", null, "secret", "admin", null);
        userService.grantAdminRole(testUserId);

        userService.signUp("user@email.com", null, "secret", "user", null);

        logger.info("Dev seed data loaded.");
    }
}
