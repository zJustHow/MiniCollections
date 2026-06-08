package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.exception.CategoryNotFoundException;
import com.zjusthow.minicollections.exception.LimitExceededException;
import com.zjusthow.minicollections.exception.NoPermissionException;
import com.zjusthow.minicollections.exception.ScaleNotFoundException;
import com.zjusthow.minicollections.exception.SeriesNotFoundException;
import com.zjusthow.minicollections.exception.SubmissionAlreadyReviewedException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.model.ApprovalBody;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.model.ObjectSubmissionDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.SubmissionBody;
import com.zjusthow.minicollections.model.SubmissionStatusCounts;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.ObjectSubmissionRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;

@Service
public class SubmissionService {

    private static final int DEFAULT_PAGE_SIZE = 24;
    private static final int MAX_PAGE_SIZE = 100;

    private final ObjectSubmissionRepository submissionRepository;
    private final BrandRepository brandRepository;
    private final SeriesRepository seriesRepository;
    private final CategoryRepository categoryRepository;
    private final ScaleRepository scaleRepository;
    private final UserRepository userRepository;
    private final BrandService brandService;
    private final ImageStorageService imageStorageService;

    @Value("${app.limits.max-submissions-per-day}")
    private int maxSubmissionsPerDay;

    public SubmissionService(
            ObjectSubmissionRepository submissionRepository,
            BrandRepository brandRepository,
            SeriesRepository seriesRepository,
            CategoryRepository categoryRepository,
            ScaleRepository scaleRepository,
            UserRepository userRepository,
            BrandService brandService,
            @Autowired(required = false) ImageStorageService imageStorageService) {
        this.submissionRepository = submissionRepository;
        this.brandRepository = brandRepository;
        this.seriesRepository = seriesRepository;
        this.categoryRepository = categoryRepository;
        this.scaleRepository = scaleRepository;
        this.userRepository = userRepository;
        this.brandService = brandService;
        this.imageStorageService = imageStorageService;
    }

    public ObjectSubmissionDto submit(Long userId, SubmissionBody body) {
        validateCategoryId(body.categoryId());
        validateScaleId(body.scaleId());
        validateSeriesForBrand(body.seriesId(), body.brandId());
        OffsetDateTime startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().atOffset(ZoneOffset.UTC);
        int todayCount = submissionRepository.countBySubmittedByUserIdAndSubmittedAtAfter(userId, startOfDay);
        if (todayCount >= maxSubmissionsPerDay) {
            throw new LimitExceededException("error.submission.limit", maxSubmissionsPerDay);
        }
        ObjectSubmissionEntity entity = new ObjectSubmissionEntity(
                null, userId, body.submissionType(),
                body.nameEn(), body.nameZh(), body.imageUrl(),
                body.releasePriceCny(), body.releasePriceUsd(), body.releaseDate(),
                body.brandId(), body.customBrandName(),
                body.seriesId(), body.categoryId(), body.scaleId(),
                body.notes(), "PENDING", OffsetDateTime.now(),
                null, null, null, null
        );
        return toDto(submissionRepository.save(entity));
    }

    public PageResponse<ObjectSubmissionDto> listByUserPage(Long userId, int page, int size) {
        int pageSize = clampSize(size);
        int safePage = clampPage(page);
        long total = submissionRepository.countBySubmittedByUserId(userId);
        List<ObjectSubmissionEntity> entities = submissionRepository.findPageBySubmittedByUserId(
                userId, pageSize, offset(safePage, pageSize));
        return PageResponse.of(toDtos(entities), safePage, pageSize, total, true);
    }

    public PageResponse<ObjectSubmissionDto> listByStatusPage(String status, int page, int size) {
        int pageSize = clampSize(size);
        int safePage = clampPage(page);
        String normalizedStatus = normalizeStatusFilter(status);
        long total = submissionRepository.countByStatusFilter(normalizedStatus);
        List<ObjectSubmissionEntity> entities = submissionRepository.findPageByStatus(
                normalizedStatus, pageSize, offset(safePage, pageSize));
        return PageResponse.of(toDtos(entities), safePage, pageSize, total, true);
    }

    public SubmissionStatusCounts getStatusCounts() {
        return new SubmissionStatusCounts(
                submissionRepository.countByStatus("PENDING"),
                submissionRepository.countByStatus("APPROVED"),
                submissionRepository.countByStatus("REJECTED"),
                submissionRepository.count());
    }

    @Transactional
    public void deleteByUser(Long userId, Long submissionId) {
        ObjectSubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found"));
        if (!Objects.equals(submission.submittedByUserId(), userId)) {
            throw new NoPermissionException("No permission to delete this submission");
        }
        deleteUserImage(userId, submission.imageUrl());
        submissionRepository.deleteById(submissionId);
    }

    @Transactional
    public ObjectSubmissionDto approve(Long submissionId, Long adminUserId, ApprovalBody body) {
        validateCategoryId(body.categoryId());
        validateScaleId(body.scaleId());
        validateSeriesForBrand(body.seriesId(), body.brandId());
        ObjectSubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found"));
        if (!"PENDING".equals(submission.status())) {
            throw new SubmissionAlreadyReviewedException();
        }

        if ("MISSING_MODEL".equals(submission.submissionType())) {
            if (body.brandId() == null || body.nameEn() == null || body.nameEn().isBlank()) {
                throw new ValidationException("error.approval_missing_fields");
            }
            BrandObjectBody brandObjectBody = new BrandObjectBody(
                    body.nameEn(), body.nameZh(), body.imageUrl(), body.imageSource(),
                    body.releasePriceCny(), body.releasePriceUsd(), body.releaseDate(),
                    body.seriesId(), body.categoryId(), body.scaleId()
            );
            brandService.createBrandObject(body.brandId(), brandObjectBody, "en-US");
        }

        return toDto(submissionRepository.save(
                withStatus(submission, "APPROVED", adminUserId, null, body.adminNote())
        ));
    }

    @Transactional
    public ObjectSubmissionDto reject(Long submissionId, Long adminUserId, String reason) {
        ObjectSubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found"));
        if (!"PENDING".equals(submission.status())) {
            throw new SubmissionAlreadyReviewedException();
        }
        return toDto(submissionRepository.save(
                withStatus(submission, "REJECTED", adminUserId, reason, null)
        ));
    }

    private String normalizeStatusFilter(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }
        return status;
    }

    private void validateCategoryId(Long categoryId) {
        if (categoryId == null) {
            return;
        }
        if (!categoryRepository.existsById(categoryId)) {
            throw new CategoryNotFoundException();
        }
    }

    private void validateScaleId(Long scaleId) {
        if (scaleId == null) {
            return;
        }
        if (!scaleRepository.existsById(scaleId)) {
            throw new ScaleNotFoundException();
        }
    }

    private void validateSeriesForBrand(Long seriesId, Long brandId) {
        if (seriesId == null) {
            return;
        }
        if (brandId == null) {
            throw new ValidationException("error.brand_required_for_series");
        }
        SeriesEntity series = seriesRepository.findById(seriesId)
                .orElseThrow(SeriesNotFoundException::new);
        if (!Objects.equals(series.brandId(), brandId)) {
            throw new ValidationException("error.series_brand_mismatch");
        }
    }

    private ObjectSubmissionEntity withStatus(
            ObjectSubmissionEntity s, String status, Long reviewerId, String rejectReason, String adminNote) {
        return new ObjectSubmissionEntity(
                s.id(), s.submittedByUserId(), s.submissionType(),
                s.nameEn(), s.nameZh(), s.imageUrl(),
                s.releasePriceCny(), s.releasePriceUsd(), s.releaseDate(),
                s.brandId(), s.customBrandName(),
                s.seriesId(), s.categoryId(), s.scaleId(),
                s.notes(), status, s.submittedAt(),
                reviewerId, OffsetDateTime.now(), rejectReason, adminNote
        );
    }

    private void deleteUserImage(long userId, String imageUrl) {
        if (imageStorageService != null) {
            imageStorageService.deleteUserImageIfOwned(userId, imageUrl);
        }
    }

    private int clampPage(int page) {
        return Math.max(page, 0);
    }

    private int offset(int page, int pageSize) {
        return page * pageSize;
    }

    private int clampSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }

    private List<ObjectSubmissionDto> toDtos(List<ObjectSubmissionEntity> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }

        Set<Long> userIds = new HashSet<>();
        Set<Long> brandIds = new HashSet<>();
        Set<Long> seriesIds = new HashSet<>();
        Set<Long> categoryIds = new HashSet<>();
        Set<Long> scaleIds = new HashSet<>();
        for (ObjectSubmissionEntity entity : entities) {
            userIds.add(entity.submittedByUserId());
            if (entity.brandId() != null) {
                brandIds.add(entity.brandId());
            }
            if (entity.seriesId() != null) {
                seriesIds.add(entity.seriesId());
            }
            if (entity.categoryId() != null) {
                categoryIds.add(entity.categoryId());
            }
            if (entity.scaleId() != null) {
                scaleIds.add(entity.scaleId());
            }
        }

        Map<Long, String> submitterNamesByUserId = new HashMap<>();
        userRepository.findAllById(userIds)
                .forEach(user -> submitterNamesByUserId.put(user.id(), user.displayName()));

        Map<Long, String> brandNamesById = new HashMap<>();
        if (!brandIds.isEmpty()) {
            brandRepository.findAllById(brandIds)
                    .forEach(brand -> brandNamesById.put(brand.id(), brand.nameEn()));
        }

        Map<Long, SeriesEntity> seriesById = new HashMap<>();
        if (!seriesIds.isEmpty()) {
            seriesRepository.findAllById(seriesIds).forEach(series -> seriesById.put(series.id(), series));
        }

        Map<Long, CategoryEntity> categoryById = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository.findAllById(categoryIds)
                    .forEach(category -> categoryById.put(category.id(), category));
        }

        Map<Long, ScaleEntity> scaleById = new HashMap<>();
        if (!scaleIds.isEmpty()) {
            scaleRepository.findAllById(scaleIds).forEach(scale -> scaleById.put(scale.id(), scale));
        }

        return entities.stream()
                .map(entity -> toDto(
                        entity,
                        submitterNamesByUserId,
                        brandNamesById,
                        seriesById,
                        categoryById,
                        scaleById))
                .toList();
    }

    private ObjectSubmissionDto toDto(ObjectSubmissionEntity entity) {
        return toDtos(List.of(entity)).get(0);
    }

    private ObjectSubmissionDto toDto(
            ObjectSubmissionEntity entity,
            Map<Long, String> submitterNamesByUserId,
            Map<Long, String> brandNamesById,
            Map<Long, SeriesEntity> seriesById,
            Map<Long, CategoryEntity> categoryById,
            Map<Long, ScaleEntity> scaleById) {
        String submitterName = submitterNamesByUserId.getOrDefault(entity.submittedByUserId(), "Unknown");
        String brandName = entity.brandId() != null
                ? brandNamesById.get(entity.brandId())
                : entity.customBrandName();
        SeriesEntity series = entity.seriesId() != null ? seriesById.get(entity.seriesId()) : null;
        CategoryEntity category = entity.categoryId() != null ? categoryById.get(entity.categoryId()) : null;
        ScaleEntity scale = entity.scaleId() != null ? scaleById.get(entity.scaleId()) : null;
        return new ObjectSubmissionDto(
                entity.id(), entity.submittedByUserId(), submitterName,
                entity.submissionType(),
                entity.nameEn(), entity.nameZh(), entity.imageUrl(),
                entity.releasePriceCny(), entity.releasePriceUsd(), entity.releaseDate(),
                entity.brandId(), brandName,
                entity.seriesId(),
                series != null ? series.nameEn() : null,
                series != null ? series.nameZh() : null,
                entity.categoryId(),
                category != null ? category.nameEn() : null,
                category != null ? category.nameZh() : null,
                entity.scaleId(),
                scale != null ? scale.code() : null,
                entity.notes(), entity.status(), entity.submittedAt(), entity.rejectReason(), entity.adminNote()
        );
    }
}
