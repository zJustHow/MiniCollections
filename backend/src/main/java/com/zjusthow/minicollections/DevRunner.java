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
        long t = userService.signUp("test@email.com", null, "secret", "test", null);
        List<GroupEntity> testGroups = groupRepository.saveAll(List.of(
                new GroupEntity(null, t, "TestGroup1", null),
                new GroupEntity(null, t, "TestGroup2", null)
        ));
        long g4a = testGroups.get(0).id();
        long g4b = testGroups.get(1).id();

        userObjectRepository.saveAll(List.of(
                new UserObjectEntity(null, t, g4a, null, "TestGroup1Object1", null, null, null, null),
                new UserObjectEntity(null, t, g4a, null, "TestGroup1Object2", null, null, null, null),
                new UserObjectEntity(null, t, g4b, null, "TestGroup2Object1", null, null, null, null),
                new UserObjectEntity(null, t, g4b, null, "TestGroup2Object2", null, null, null, null)
        ));

        logger.info("Dev seed data loaded.");
    }
}
