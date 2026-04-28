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
        List<BrandEntity> brands = brandRepository.saveAll(List.of(
                new BrandEntity(null, "Brand1", null, null),
                new BrandEntity(null, "Brand2", null, null)
        ));
        long b1 = brands.get(0).id();
        long b2 = brands.get(1).id();

        brandObjectRepository.saveAll(List.of(
                new BrandObjectEntity(null, b1, "Brand1Object1", null, null, null, null, null, null, null, null),
                new BrandObjectEntity(null, b1, "Brand1Object2", null, null, null, null, null, null, null, null),
                new BrandObjectEntity(null, b2, "Brand2Object1", null, null, null, null, null, null, null, null)
        ));

        long u1 = userService.signUp("user1@email.com", "secret1", "User1", null);
        long u2 = userService.signUp("user2@email.com", "secret2", "User2", null);
        long u3 = userService.signUp("user3@email.com", "secret3", "User3", null);

        List<GroupEntity> groups = groupRepository.saveAll(List.of(
                new GroupEntity(null, u1, "User1Group1", null),
                new GroupEntity(null, u1, "User1Group2", null),
                new GroupEntity(null, u2, "User2Group1", null),
                new GroupEntity(null, u2, "User2Group2", null),
                new GroupEntity(null, u3, "User3Group1", null),
                new GroupEntity(null, u3, "User3Group2", null)
        ));
        long g1 = groups.get(0).id();
        long g2 = groups.get(1).id();
        long g3 = groups.get(2).id();

        userObjectRepository.saveAll(List.of(
                new UserObjectEntity(null, u1, g1, null, "User1Group1Object1", null, null, null, null),
                new UserObjectEntity(null, u1, g1, null, "User1Group1Object2", null, null, null, null),
                new UserObjectEntity(null, u1, g2, null, "User1Group2Object1", null, null, null, null),
                new UserObjectEntity(null, u1, g2, null, "User1Group2Object2", null, null, null, null),
                new UserObjectEntity(null, u2, g3, null, "User2Group1Object1", null, null, null, null),
                new UserObjectEntity(null, u2, g3, null, "User2Group1Object2", null, null, null, null)
        ));

        long u4 = userService.signUp("test@email.com", "test", "test", null);
        List<GroupEntity> testGroups = groupRepository.saveAll(List.of(
                new GroupEntity(null, u4, "TestGroup1", null),
                new GroupEntity(null, u4, "TestGroup2", null)
        ));
        long g4a = testGroups.get(0).id();
        long g4b = testGroups.get(1).id();

        userObjectRepository.saveAll(List.of(
                new UserObjectEntity(null, u4, g4a, null, "TestGroup1Object1", null, null, null, null),
                new UserObjectEntity(null, u4, g4a, null, "TestGroup1Object2", null, null, null, null),
                new UserObjectEntity(null, u4, g4b, null, "TestGroup2Object1", null, null, null, null),
                new UserObjectEntity(null, u4, g4b, null, "TestGroup2Object2", null, null, null, null)
        ));

        logger.info("Dev seed data loaded.");
    }
}
