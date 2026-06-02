package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectDocument;
import com.zjusthow.minicollections.elasticsearch.BrandObjectSearchRepository;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import com.zjusthow.minicollections.exception.LimitExceededException;
import com.zjusthow.minicollections.exception.SubmissionAlreadyReviewedException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.model.ApprovalBody;
import com.zjusthow.minicollections.model.ObjectSubmissionDto;
import com.zjusthow.minicollections.model.SubmissionBody;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.ObjectSubmissionRepository;
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

@Service
public class SubmissionService {

    private final ObjectSubmissionRepository submissionRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final BrandRepository brandRepository;
    private final UserRepository userRepository;
    private final BrandObjectSearchRepository brandObjectSearchRepository;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    @Value("${app.limits.max-submissions-per-day}")
    private int maxSubmissionsPerDay;

    public SubmissionService(
            ObjectSubmissionRepository submissionRepository,
            BrandObjectRepository brandObjectRepository,
            BrandRepository brandRepository,
            UserRepository userRepository,
            @Autowired(required = false) BrandObjectSearchRepository brandObjectSearchRepository) {
        this.submissionRepository = submissionRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.brandRepository = brandRepository;
        this.userRepository = userRepository;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
    }

    public ObjectSubmissionDto submit(Long userId, SubmissionBody body) {
        OffsetDateTime startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().atOffset(ZoneOffset.UTC);
        int todayCount = submissionRepository.countBySubmittedByUserIdAndSubmittedAtAfter(userId, startOfDay);
        if (todayCount >= maxSubmissionsPerDay) {
            throw new LimitExceededException("error.submission.limit", maxSubmissionsPerDay);
        }
        ObjectSubmissionEntity entity = new ObjectSubmissionEntity(
                null, userId, body.submissionType(),
                body.brandId(), body.customBrandName(),
                body.nameEn(), body.nameZh(), body.imageUrl(),
                body.releasePriceCny(), body.releasePriceUsd(), body.releaseDate(),
                body.categoryEn(), body.categoryZh(), body.scale(),
                body.notes(), "PENDING", OffsetDateTime.now(),
                null, null, null, null
        );
        return toDto(submissionRepository.save(entity));
    }

    public List<ObjectSubmissionDto> listByUser(Long userId) {
        return submissionRepository.findBySubmittedByUserId(userId)
                .stream().map(this::toDto).toList();
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
        ObjectSubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found"));
        if (!"PENDING".equals(submission.status())) {
            throw new SubmissionAlreadyReviewedException();
        }

        if ("MISSING_MODEL".equals(submission.submissionType())) {
            if (body.brandId() == null || body.nameEn() == null || body.nameEn().isBlank()) {
                throw new ValidationException("brandId and nameEn are required to approve a MISSING_MODEL submission");
            }
            BrandObjectEntity brandObject = new BrandObjectEntity(
                    null, body.brandId(), body.nameEn(), body.nameZh(), body.imageUrl(), body.imageSource(),
                    body.releasePriceCny(), body.releasePriceUsd(), body.releaseDate(),
                    body.categoryEn(), body.categoryZh(), body.scale(), 0L
            );
            BrandObjectEntity saved = brandObjectRepository.save(brandObject);
            if (elasticsearchEnabled && brandObjectSearchRepository != null) {
                var brand = brandRepository.findById(body.brandId()).orElse(null);
                brandObjectSearchRepository.save(BrandObjectDocument.from(
                        saved,
                        brand != null ? brand.nameEn() : null,
                        brand != null ? brand.nameZh() : null));
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

    private ObjectSubmissionEntity withStatus(
            ObjectSubmissionEntity s, String status, Long reviewerId, String rejectReason, String adminNote) {
        return new ObjectSubmissionEntity(
                s.id(), s.submittedByUserId(), s.submissionType(),
                s.brandId(), s.customBrandName(),
                s.nameEn(), s.nameZh(), s.imageUrl(),
                s.releasePriceCny(), s.releasePriceUsd(), s.releaseDate(),
                s.categoryEn(), s.categoryZh(), s.scale(),
                s.notes(), status, s.submittedAt(),
                reviewerId, OffsetDateTime.now(), rejectReason, adminNote
        );
    }

    private ObjectSubmissionDto toDto(ObjectSubmissionEntity e) {
        String submitterName = userRepository.findById(e.submittedByUserId())
                .map(u -> u.displayName())
                .orElse("Unknown");
        String brandName = e.brandId() != null
                ? brandRepository.findById(e.brandId()).map(b -> b.nameEn()).orElse(null)
                : e.customBrandName();
        return new ObjectSubmissionDto(
                e.id(), e.submittedByUserId(), submitterName,
                e.submissionType(),
                e.brandId(), brandName,
                e.nameEn(), e.nameZh(), e.imageUrl(),
                e.releasePriceCny(), e.releasePriceUsd(), e.releaseDate(),
                e.categoryEn(), e.categoryZh(), e.scale(),
                e.notes(), e.status(), e.submittedAt(), e.rejectReason(), e.adminNote()
        );
    }
}
