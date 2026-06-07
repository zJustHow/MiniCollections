package com.zjusthow.minicollections;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import com.zjusthow.minicollections.entity.UserObjectEntity;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.ObjectSubmissionRepository;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.repository.UserObjectRepository;
import com.zjusthow.minicollections.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("dev")
public class DevRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DevRunner.class);

    /** Frontend PAGE_SIZE=48 with one add-card slot → 2 pages at 48 groups, 3 pages at 97. */
    private static final int MOCK_EXTRA_GROUP_COUNT = 55;

    /** Enough objects in one group for 3 detail pages (47 + 48 + 5 with add-card slot). */
    private static final int MOCK_OBJECTS_IN_MAIN_GROUP = 100;

    private static final int BRAND_OBJECT_BATCH_SIZE = 48;

    private final BrandObjectRepository brandObjectRepository;
    private final GroupRepository groupRepository;
    private final ObjectSubmissionRepository submissionRepository;
    private final UserObjectRepository userObjectRepository;
    private final UserService userService;

    public DevRunner(
            BrandObjectRepository brandObjectRepository,
            GroupRepository groupRepository,
            ObjectSubmissionRepository submissionRepository,
            UserObjectRepository userObjectRepository,
            UserService userService
    ) {
        this.brandObjectRepository = brandObjectRepository;
        this.groupRepository = groupRepository;
        this.submissionRepository = submissionRepository;
        this.userObjectRepository = userObjectRepository;
        this.userService = userService;
    }

    @Override
    public void run(ApplicationArguments args) {
        Long adminId = userService.signUp("admin@email.com", null, "secret", "admin", null);
        userService.grantAdminRole(adminId);

        Long userId = userService.signUp("user@email.com", null, "secret", "user", null);

        seedAdminCollection(adminId);
        seedPendingSubmissions(userId);

        logger.info("Dev seed data loaded.");
    }

    private void seedAdminCollection(Long adminId) {
        Long defaultGroupId = groupRepository.findByUserId(adminId)
                .orElse(List.of())
                .stream()
                .filter(g -> DisplayLocaleResolver.isDefaultGroupName(g.name()))
                .map(GroupEntity::id)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Admin default group not found"));

        List<GroupEntity> themedGroups = groupRepository.saveAll(List.of(
                new GroupEntity(null, adminId, "JDM", null),
                new GroupEntity(null, adminId, "GT & Supercars", null)
        ));
        long jdmGroupId = themedGroups.get(0).id();
        long supercarGroupId = themedGroups.get(1).id();

        List<GroupEntity> paginationGroups = new ArrayList<>(MOCK_EXTRA_GROUP_COUNT);
        for (int i = 1; i <= MOCK_EXTRA_GROUP_COUNT; i++) {
            paginationGroups.add(new GroupEntity(null, adminId, "Collection %02d".formatted(i), null));
        }
        groupRepository.saveAll(paginationGroups);

        List<UserObjectEntity> objects = new ArrayList<>();
        addManyLinkedObjects(
                objects,
                adminId,
                defaultGroupId,
                1L,
                MOCK_OBJECTS_IN_MAIN_GROUP,
                LocalDate.of(2024, 1, 1),
                new BigDecimal("79.00"));
        addLinkedObjects(objects, adminId, jdmGroupId,
                brandObjectRepository.findPageByBrandId(4L, 6, 0),
                LocalDate.of(2023, 11, 20), new BigDecimal("120.00"));
        addLinkedObjects(objects, adminId, supercarGroupId,
                brandObjectRepository.findPageByBrandId(13L, 6, 0),
                LocalDate.of(2025, 1, 8), new BigDecimal("95.50"));

        userObjectRepository.saveAll(objects);
    }

    private void addManyLinkedObjects(
            List<UserObjectEntity> target,
            Long userId,
            Long groupId,
            long brandId,
            int count,
            LocalDate basePurchaseDate,
            BigDecimal basePurchasePrice
    ) {
        int added = 0;
        int brandOffset = 0;
        while (added < count) {
            List<BrandObjectEntity> batch = brandObjectRepository.findPageByBrandId(
                    brandId, BRAND_OBJECT_BATCH_SIZE, brandOffset);
            if (batch.isEmpty()) {
                break;
            }
            for (BrandObjectEntity brandObject : batch) {
                if (added >= count) {
                    return;
                }
                target.add(new UserObjectEntity(
                        null,
                        userId,
                        groupId,
                        brandObject.id(),
                        brandObject.nameEn(),
                        brandObject.imageUrl(),
                        basePurchaseDate.plusDays(added),
                        basePurchasePrice.add(BigDecimal.valueOf(added % 20)),
                        "Dev mock collection item #%d".formatted(added + 1)
                ));
                added++;
            }
            brandOffset += batch.size();
        }
    }

    private void addLinkedObjects(
            List<UserObjectEntity> target,
            Long userId,
            Long groupId,
            List<BrandObjectEntity> brandObjects,
            LocalDate purchaseDate,
            BigDecimal purchasePrice
    ) {
        for (BrandObjectEntity brandObject : brandObjects) {
            target.add(new UserObjectEntity(
                    null,
                    userId,
                    groupId,
                    brandObject.id(),
                    brandObject.nameEn(),
                    brandObject.imageUrl(),
                    purchaseDate,
                    purchasePrice,
                    "Dev mock collection item"
            ));
        }
    }

    private void seedPendingSubmissions(Long userId) {
        OffsetDateTime now = OffsetDateTime.now();
        submissionRepository.saveAll(List.of(
                new ObjectSubmissionEntity(
                        null, userId, "MISSING_MODEL",
                        "Nissan Skyline GT-R V.spec II Nür", "日产 Skyline GT-R V.spec II Nür",
                        null, new BigDecimal("150.00"), null, LocalDate.of(2024, 6, 1),
                        4L, null, null, 1L, 64L,
                        "Missing TLV release from 2024 catalog.", "PENDING", now,
                        null, null, null, null
                ),
                new ObjectSubmissionEntity(
                        null, userId, "DATA_CORRECTION",
                        "Honda Civic Type R (FK8) Championship White", null,
                        null, null, null, null,
                        1L, null, 1019L, 1L, 64L,
                        "Release date should be 2018-03, not blank.", "PENDING", now,
                        null, null, null, null
                ),
                new ObjectSubmissionEntity(
                        null, userId, "BUG_REPORT",
                        null, null, null, null, null, null,
                        null, null, null, null, null,
                        "Brand filter resets when switching tabs on mobile.", "PENDING", now,
                        null, null, null, null
                )
        ));
    }
}
