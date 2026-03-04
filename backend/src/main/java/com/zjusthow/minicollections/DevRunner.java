package com.zjusthow.minicollections;

import com.zjusthow.minicollections.entity.*;
import com.zjusthow.minicollections.repository.*;
import com.zjusthow.minicollections.model.*;
import com.zjusthow.minicollections.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DevRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DevRunner.class);

    private final BrandObjectRepository brandObjectRepository;
    private final BrandRepository brandRepository;
    private final GroupRepository groupRepository;
    private final UserObjectRepository userObjectRepository;
    private final UserRepository userRepository;
    private final BrandService brandService;
    private final UserService userService;

    public DevRunner(
            BrandObjectRepository brandObjectRepository,
            BrandRepository brandRepository,
            GroupRepository groupRepository,
            UserObjectRepository userObjectRepository,
            UserRepository userRepository,
            BrandService brandService,
            UserService userService
    ) {
        this.brandObjectRepository = brandObjectRepository;
        this.brandRepository = brandRepository;
        this.groupRepository = groupRepository;
        this.userObjectRepository = userObjectRepository;
        this.userRepository = userRepository;
        this.brandService = brandService;
        this.userService = userService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {

        brandRepository.saveAll(List.of(
                new BrandEntity(null, "MINIGT", null),
                new BrandEntity(null, "LCD", null)
        ));

        brandObjectRepository.saveAll(List.of(
                new BrandObjectEntity(null, 1L, "MINIGT001", null, null, null),
                new BrandObjectEntity(null, 1L, "MINIGT002", null, null, null),
                new BrandObjectEntity(null, 2L, "LCD001", null, null, null)
        ));

        userRepository.saveAll(List.of(
                new UserEntity(null, "user1@email.com", "secret1", true, "User1"),
                new UserEntity(null, "user2@email.com", "secret2", true, "User2"),
                new UserEntity(null, "user3@email.com", "secret3", true, "User3")
        ));

        groupRepository.saveAll(List.of(
                new GroupEntity(null, 1L, "User1Group1", null),
                new GroupEntity(null, 1L, "User1Group1", null),
                new GroupEntity(null, 2L, "User2Group1", null),
                new GroupEntity(null, 2L, "User2Group2", null),
                new GroupEntity(null, 3L, "User3Group1", null),
                new GroupEntity(null, 3L, "User3Group2", null)
        ));

        userObjectRepository.saveAll(List.of(
                new UserObjectEntity(null, 1L, 1L, null, "User1Group1Object1", null, null, null, null),
                new UserObjectEntity(null, 1L, 1L, null, "User1Group1Object2", null, null, null, null),
                new UserObjectEntity(null, 1L, 2L, null, "User1Group2Object1", null, null, null, null),
                new UserObjectEntity(null, 1L, 2L, null, "User1Group2Object2", null, null, null, null),
                new UserObjectEntity(null, 2L, 3L, null, "User2Group1Object1", null, null, null, null),
                new UserObjectEntity(null, 2L, 3L, null, "User2Group1Object2", null, null, null, null)
        ));

        userService.signUp("user4@email.com", "secret4", "User4");

        groupRepository.saveAll(List.of(
                new GroupEntity(null, 4L, "User4Group1", null),
                new GroupEntity(null, 4L, "User4Group2", null)
        ));

        userObjectRepository.saveAll(List.of(
                new UserObjectEntity(null, 4L, 8L, null, "User4Group1Object1", null, null, null, null),
                new UserObjectEntity(null, 4L, 8L, null, "User4Group1Object2", null, null, null, null),
                new UserObjectEntity(null, 4L, 9L, null, "User4Group2Object1", null, null, null, null),
                new UserObjectEntity(null, 4L, 9L, null, "User4Group2Object2", null, null, null, null)
        ));

        userService.signUp("user5@email.com", "secret5", "User5");
    }

}
