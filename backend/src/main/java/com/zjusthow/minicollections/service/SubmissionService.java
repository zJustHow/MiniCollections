package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectDocument;
import com.zjusthow.minicollections.elasticsearch.BrandObjectSearchRepository;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
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
import com.zjusthow.minicollections.model.ObjectSubmissionDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.SubmissionBody;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.ObjectSubmissionRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

@Service
public class SubmissionService {

    private static final int DEFAULT_PAGE_SIZE = 24;
    private static final int MAX_PAGE_SIZE = 100;

    private final ObjectSubmissionRepository submissionRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final BrandRepository brandRepository;
    private final SeriesRepository seriesRepository;
    private final CategoryRepository categoryRepository;
    private final ScaleRepository scaleRepository;
    private final UserRepository userRepository;
    private final BrandObjectSearchRepository brandObjectSearchRepository;
    private final ImageStorageService imageStorageService;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    @Value("${app.limits.max-submissions-per-day}")
    private int maxSubmissionsPerDay;

    public SubmissionService(
            ObjectSubmissionRepository submissionRepository,
            BrandObjectRepository brandObjectRepository,
            BrandRepository brandRepository,
            SeriesRepository seriesRepository,
            CategoryRepository categoryRepository,
            ScaleRepository scaleRepository,
            UserRepository userRepository,
            @Autowired(required = false) BrandObjectSearchRepository brandObjectSearchRepository,
            @Autowired(required = false) ImageStorageService imageStorageService) {
        this.submissionRepository = submissionRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.brandRepository = brandRepository;
        this.seriesRepository = seriesRepository;
        this.categoryRepository = categoryRepository;
        this.scaleRepository = scaleRepository;
        this.userRepository = userRepository;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
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
        List<ObjectSubmissionDto> content = entities.stream().map(this::toDto).toList();
        return PageResponse.of(content, safePage, pageSize, total, true);
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

    public List<ObjectSubmissionDto> listByStatus(String status) {
        List<ObjectSubmissionEntity> entities = status != null
                ? submissionRepository.findByStatus(status)
                : submissionRepository.findAll();
        return entities.stream().map(this::toDto).toList();
    }

    @Transactional
    @CacheEvict(value = "brandObjects", allEntries = true)
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
            BrandObjectEntity brandObject = new BrandObjectEntity(
                    null, body.nameEn(), body.nameZh(), body.imageUrl(), body.imageSource(),
                    body.releasePriceCny(), body.releasePriceUsd(), body.releaseDate(),
                    body.brandId(), body.seriesId(), body.categoryId(), body.scaleId(), 0L
            );
            BrandObjectEntity saved = brandObjectRepository.save(brandObject);
            if (elasticsearchEnabled && brandObjectSearchRepository != null) {
                var brand = brandRepository.findById(body.brandId()).orElse(null);
                SeriesEntity series = body.seriesId() != null
                        ? seriesRepository.findById(body.seriesId()).orElse(null)
                        : null;
                CategoryEntity category = body.categoryId() != null
                        ? categoryRepository.findById(body.categoryId()).orElse(null)
                        : null;
                ScaleEntity scale = body.scaleId() != null
                        ? scaleRepository.findById(body.scaleId()).orElse(null)
                        : null;
                brandObjectSearchRepository.save(BrandObjectDocument.from(
                        saved,
                        brand != null ? brand.nameEn() : null,
                        brand != null ? brand.abbreviation() : null,
                        brand != null ? brand.nameZh() : null,
                        series != null ? series.nameEn() : null,
                        series != null ? series.nameZh() : null,
                        category != null ? category.nameEn() : null,
                        category != null ? category.nameZh() : null,
                        scale != null ? scale.code() : null));
            }
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

    private ObjectSubmissionDto toDto(ObjectSubmissionEntity e) {
        String submitterName = userRepository.findById(e.submittedByUserId())
                .map(u -> u.displayName())
                .orElse("Unknown");
        String brandName = e.brandId() != null
                ? brandRepository.findById(e.brandId()).map(b -> b.nameEn()).orElse(null)
                : e.customBrandName();
        SeriesEntity series = e.seriesId() != null
                ? seriesRepository.findById(e.seriesId()).orElse(null)
                : null;
        CategoryEntity category = e.categoryId() != null
                ? categoryRepository.findById(e.categoryId()).orElse(null)
                : null;
        ScaleEntity scale = e.scaleId() != null
                ? scaleRepository.findById(e.scaleId()).orElse(null)
                : null;
        return new ObjectSubmissionDto(
                e.id(), e.submittedByUserId(), submitterName,
                e.submissionType(),
                e.nameEn(), e.nameZh(), e.imageUrl(),
                e.releasePriceCny(), e.releasePriceUsd(), e.releaseDate(),
                e.brandId(), brandName,
                e.seriesId(),
                series != null ? series.nameEn() : null,
                series != null ? series.nameZh() : null,
                e.categoryId(),
                category != null ? category.nameEn() : null,
                category != null ? category.nameZh() : null,
                e.scaleId(),
                scale != null ? scale.code() : null,
                e.notes(), e.status(), e.submittedAt(), e.rejectReason(), e.adminNote()
        );
    }
}
