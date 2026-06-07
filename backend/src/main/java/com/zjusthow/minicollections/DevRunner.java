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

    /** Feedback FEEDBACK_PAGE_SIZE=24 → 3+ pages for user@email.com. */
    private static final int MOCK_USER1_PENDING_COUNT = 55;
    private static final int MOCK_USER1_APPROVED_COUNT = 12;
    private static final int MOCK_USER1_REJECTED_COUNT = 5;

    /** Feedback FEEDBACK_PAGE_SIZE=24 → 3+ pages for admin@email.com. */
    private static final int MOCK_ADMIN_PENDING_COUNT = 40;
    private static final int MOCK_ADMIN_APPROVED_COUNT = 20;
    private static final int MOCK_ADMIN_REJECTED_COUNT = 10;

    /** Extra pending items from a second user (admin pending tab pageSize=20). */
    private static final int MOCK_USER2_PENDING_COUNT = 18;

    /** Admin Table pageSize=20 → 2+ pages on approved / rejected tabs. */
    private static final int MOCK_EXTRA_APPROVED_COUNT = 28;
    private static final int MOCK_EXTRA_REJECTED_COUNT = 28;

    private static final int BRAND_OBJECT_BATCH_SIZE = 48;
    private static final String[] SUBMISSION_TYPES = {"MISSING_MODEL", "DATA_CORRECTION", "BUG_REPORT"};

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
        Long user2Id = userService.signUp("user2@email.com", null, "secret", "user2", null);

        seedAdminCollection(adminId);
        seedSubmissions(userId, user2Id, adminId);

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

    private void seedSubmissions(Long userId, Long user2Id, Long adminId) {
        List<BrandObjectEntity> namePool = brandObjectRepository.findPageByBrandId(4L, 200, 0);
        if (namePool.isEmpty()) {
            throw new IllegalStateException("No brand objects found for dev submission seed");
        }

        List<ObjectSubmissionEntity> submissions = new ArrayList<>();
        int index = 0;

        for (int i = 0; i < MOCK_USER1_PENDING_COUNT; i++) {
            submissions.add(mockSubmission(
                    userId,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "PENDING",
                    adminId,
                    namePool.get(i % namePool.size())
            ));
        }
        for (int i = 0; i < MOCK_USER1_APPROVED_COUNT; i++) {
            submissions.add(mockSubmission(
                    userId,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "APPROVED",
                    adminId,
                    namePool.get(i % namePool.size())
            ));
        }
        for (int i = 0; i < MOCK_USER1_REJECTED_COUNT; i++) {
            submissions.add(mockSubmission(
                    userId,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "REJECTED",
                    adminId,
                    namePool.get(i % namePool.size())
            ));
        }

        for (int i = 0; i < MOCK_USER2_PENDING_COUNT; i++) {
            submissions.add(mockSubmission(
                    user2Id,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "PENDING",
                    adminId,
                    namePool.get(i % namePool.size())
            ));
        }
        for (int i = 0; i < MOCK_EXTRA_APPROVED_COUNT; i++) {
            submissions.add(mockSubmission(
                    user2Id,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "APPROVED",
                    adminId,
                    namePool.get(i % namePool.size())
            ));
        }
        for (int i = 0; i < MOCK_EXTRA_REJECTED_COUNT; i++) {
            submissions.add(mockSubmission(
                    user2Id,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "REJECTED",
                    adminId,
                    namePool.get(i % namePool.size())
            ));
        }

        for (int i = 0; i < MOCK_ADMIN_PENDING_COUNT; i++) {
            submissions.add(mockSubmission(
                    adminId,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "PENDING",
                    userId,
                    namePool.get(i % namePool.size())
            ));
        }
        for (int i = 0; i < MOCK_ADMIN_APPROVED_COUNT; i++) {
            submissions.add(mockSubmission(
                    adminId,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "APPROVED",
                    userId,
                    namePool.get(i % namePool.size())
            ));
        }
        for (int i = 0; i < MOCK_ADMIN_REJECTED_COUNT; i++) {
            submissions.add(mockSubmission(
                    adminId,
                    index++,
                    SUBMISSION_TYPES[i % SUBMISSION_TYPES.length],
                    "REJECTED",
                    userId,
                    namePool.get(i % namePool.size())
            ));
        }

        submissionRepository.saveAll(submissions);
    }

    private ObjectSubmissionEntity mockSubmission(
            Long userId,
            int index,
            String type,
            String status,
            Long adminId,
            BrandObjectEntity brandObject
    ) {
        OffsetDateTime submittedAt = OffsetDateTime.now().minusDays(index).minusMinutes(index * 17L);
        boolean reviewed = !"PENDING".equals(status);
        OffsetDateTime reviewedAt = reviewed ? submittedAt.plusHours(6) : null;
        Long reviewedBy = reviewed ? adminId : null;
        String rejectReason = "REJECTED".equals(status)
                ? "Dev mock rejection #%d".formatted(index + 1)
                : null;
        String adminNote = "APPROVED".equals(status) ? "Dev mock approval note." : null;

        return switch (type) {
            case "MISSING_MODEL" -> new ObjectSubmissionEntity(
                    null, userId, type,
                    brandObject.nameEn(), brandObject.nameZh(),
                    brandObject.imageUrl(),
                    new BigDecimal("120.00").add(BigDecimal.valueOf(index % 50)),
                    null,
                    LocalDate.of(2024, 1, 1).plusDays(index % 365),
                    4L, null, null, 1L, 64L,
                    "Dev mock missing model submission #%d".formatted(index + 1),
                    status, submittedAt, reviewedBy, reviewedAt, rejectReason, adminNote
            );
            case "DATA_CORRECTION" -> new ObjectSubmissionEntity(
                    null, userId, type,
                    brandObject.nameEn(), null,
                    brandObject.imageUrl(),
                    null, null, null,
                    1L, null, null, 1L, 64L,
                    "Dev mock data correction #%d — release date or scale may be wrong.".formatted(index + 1),
                    status, submittedAt, reviewedBy, reviewedAt, rejectReason, adminNote
            );
            default -> new ObjectSubmissionEntity(
                    null, userId, type,
                    null, null, null, null, null, null,
                    null, null, null, null, null,
                    "Dev mock bug report #%d — UI glitch in dev pagination test.".formatted(index + 1),
                    status, submittedAt, reviewedBy, reviewedAt, rejectReason, adminNote
            );
        };
    }
}
