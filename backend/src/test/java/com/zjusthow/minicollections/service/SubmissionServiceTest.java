package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.entity.UserEntity;
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
import com.zjusthow.minicollections.model.SubmissionStatusCounts;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.ObjectSubmissionRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock ObjectSubmissionRepository submissionRepository;
    @Mock BrandRepository brandRepository;
    @Mock SeriesRepository seriesRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock ScaleRepository scaleRepository;
    @Mock UserRepository userRepository;
    @Mock BrandService brandService;
    @Mock ImageStorageService imageStorageService;

    @InjectMocks SubmissionService submissionService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(submissionService, "maxSubmissionsPerDay", 3);
    }

    @Test
    void submit_enforcesDailyLimit() {
        when(submissionRepository.countBySubmittedByUserIdAndSubmittedAtAfter(eq(7L), any()))
                .thenReturn(3);

        SubmissionBody body = new SubmissionBody(
                "MISSING_MODEL", "Name", null, null, null, null, null,
                null, null, null, null, null, null);

        assertThrows(LimitExceededException.class, () -> submissionService.submit(7L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void submit_persistsPendingSubmission() {
        when(submissionRepository.countBySubmittedByUserIdAndSubmittedAtAfter(eq(7L), any()))
                .thenReturn(0);
        ObjectSubmissionEntity saved = pendingSubmission(42L, 7L, "FEEDBACK");
        when(submissionRepository.save(any())).thenReturn(saved);
        when(userRepository.findAllById(any())).thenReturn(List.of(
                new UserEntity(7L, "Alice", "hash", true, null, null)));

        SubmissionBody body = new SubmissionBody(
                "FEEDBACK", "Name", null, null, null, null, null,
                null, null, null, null, null, "notes");

        ObjectSubmissionDto dto = submissionService.submit(7L, body);

        assertEquals(42L, dto.id());
        assertEquals("PENDING", dto.status());
        assertEquals("Alice", dto.submitterName());
    }

    @Test
    void approve_missingModelCreatesBrandObject() {
        ObjectSubmissionEntity pending = pendingSubmission(1L, 2L, "MISSING_MODEL");
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(submissionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                new UserEntity(2L, "Bob", "hash", true, null, null)));

        ApprovalBody body = new ApprovalBody(
                "Model EN", "模型", null, null, null, null, null,
                9L, null, null, null, "approved");

        ObjectSubmissionDto dto = submissionService.approve(1L, 99L, body);

        verify(brandService).createBrandObject(eq(9L), any(), eq("en-US"));
        assertEquals("APPROVED", dto.status());
    }

    @Test
    void approve_missingModelRequiresBrandAndName() {
        ObjectSubmissionEntity pending = pendingSubmission(1L, 2L, "MISSING_MODEL");
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(pending));

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                null, null, null, null, null);

        assertThrows(ValidationException.class, () -> submissionService.approve(1L, 99L, body));
        verifyNoInteractions(brandService);
    }

    @Test
    void approve_rejectsAlreadyReviewedSubmission() {
        ObjectSubmissionEntity reviewed = new ObjectSubmissionEntity(
                1L, 2L, "FEEDBACK", "Name", null, null, null, null, null,
                null, null, null, null, null, null, "APPROVED", OffsetDateTime.now(),
                99L, OffsetDateTime.now(), null, null);
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(reviewed));

        ApprovalBody body = new ApprovalBody(
                "Name", null, null, null, null, null, null,
                null, null, null, null, null);

        assertThrows(SubmissionAlreadyReviewedException.class,
                () -> submissionService.approve(1L, 99L, body));
    }

    @Test
    void reject_updatesStatusWithReason() {
        ObjectSubmissionEntity pending = pendingSubmission(5L, 2L, "FEEDBACK");
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(pending));
        when(submissionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                new UserEntity(2L, "Bob", "hash", true, null, null)));

        ObjectSubmissionDto dto = submissionService.reject(5L, 99L, "duplicate");

        assertEquals("REJECTED", dto.status());
        assertEquals("duplicate", dto.rejectReason());
    }

    @Test
    void deleteByUser_requiresOwnership() {
        ObjectSubmissionEntity submission = pendingSubmission(8L, 3L, "FEEDBACK");
        when(submissionRepository.findById(8L)).thenReturn(Optional.of(submission));

        assertThrows(NoPermissionException.class, () -> submissionService.deleteByUser(99L, 8L));
        verify(submissionRepository, never()).deleteById(8L);
    }

    @Test
    void deleteByUser_removesOwnedSubmissionAndImage() {
        ObjectSubmissionEntity submission = pendingSubmission(8L, 3L, "FEEDBACK");
        when(submissionRepository.findById(8L)).thenReturn(Optional.of(submission));

        submissionService.deleteByUser(3L, 8L);

        verify(imageStorageService).deleteUserImageIfOwned(3L, submission.imageUrl());
        verify(submissionRepository).deleteById(8L);
    }

    @Test
    void deleteByUser_throwsWhenNotFound() {
        when(submissionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> submissionService.deleteByUser(3L, 99L));
        verify(submissionRepository, never()).deleteById(99L);
    }

    @Test
    void validateSeriesForBrand_rejectsMismatchedBrand() {
        when(seriesRepository.findById(10L)).thenReturn(Optional.of(new SeriesEntity(10L, 1L, "S", null)));

        SubmissionBody body = new SubmissionBody(
                "FEEDBACK", "Name", null, null, null, null, null,
                2L, null, 10L, null, null, null);

        assertThrows(ValidationException.class, () -> submissionService.submit(1L, body));
    }

    @Test
    void listByStatusPage_normalizesAllStatusFilter() {
        when(submissionRepository.countByStatusFilter(isNull())).thenReturn(2L);
        when(submissionRepository.findPageByStatus(isNull(), eq(24), eq(0))).thenReturn(List.of());

        PageResponse<ObjectSubmissionDto> response = submissionService.listByStatusPage("ALL", 0, 24);

        assertEquals(2L, response.totalElements());
        verify(submissionRepository).countByStatusFilter(null);
    }

    @Test
    void listByStatusPage_filtersByExplicitStatus() {
        ObjectSubmissionEntity entity = pendingSubmission(3L, 7L, "BUG_REPORT");
        when(submissionRepository.countByStatusFilter(eq("REJECTED"))).thenReturn(1L);
        when(submissionRepository.findPageByStatus(eq("REJECTED"), eq(24), eq(0)))
                .thenReturn(List.of(entity));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                new UserEntity(7L, "Alice", "hash", true, null, null)));

        PageResponse<ObjectSubmissionDto> response =
                submissionService.listByStatusPage("REJECTED", 0, 24);

        assertEquals(1, response.content().size());
        assertEquals("BUG_REPORT", response.content().get(0).submissionType());
        assertEquals("Alice", response.content().get(0).submitterName());
        verify(submissionRepository).findPageByStatus("REJECTED", 24, 0);
    }

    @Test
    void listByStatusPage_returnsEmptyPageWhenNoMatches() {
        when(submissionRepository.countByStatusFilter(eq("APPROVED"))).thenReturn(0L);
        when(submissionRepository.findPageByStatus(eq("APPROVED"), eq(24), eq(0)))
                .thenReturn(List.of());

        PageResponse<ObjectSubmissionDto> response =
                submissionService.listByStatusPage("APPROVED", 0, 24);

        assertTrue(response.content().isEmpty());
        assertEquals(0L, response.totalElements());
        verify(userRepository, never()).findAllById(any());
    }

    @Test
    void getStatusCounts_aggregatesRepositoryCounts() {
        when(submissionRepository.countByStatus("PENDING")).thenReturn(4L);
        when(submissionRepository.countByStatus("APPROVED")).thenReturn(10L);
        when(submissionRepository.countByStatus("REJECTED")).thenReturn(2L);
        when(submissionRepository.count()).thenReturn(16L);

        SubmissionStatusCounts counts = submissionService.getStatusCounts();

        assertEquals(4L, counts.pending());
        assertEquals(10L, counts.approved());
        assertEquals(2L, counts.rejected());
        assertEquals(16L, counts.total());
    }

    @Test
    void approve_feedbackSkipsBrandObjectCreation() {
        ObjectSubmissionEntity pending = pendingSubmission(1L, 2L, "FEEDBACK");
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(submissionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                new UserEntity(2L, "Bob", "hash", true, null, null)));

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                null, null, null, null, "thanks");

        ObjectSubmissionDto dto = submissionService.approve(1L, 99L, body);

        assertEquals("APPROVED", dto.status());
        assertEquals("thanks", dto.adminNote());
        verifyNoInteractions(brandService);
    }

    @Test
    void listByUserPage_returnsUserSubmissions() {
        ObjectSubmissionEntity entity = pendingSubmission(3L, 7L, "BUG_REPORT");
        when(submissionRepository.countBySubmittedByUserId(7L)).thenReturn(1L);
        when(submissionRepository.findPageBySubmittedByUserId(7L, 24, 0))
                .thenReturn(List.of(entity));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                new UserEntity(7L, "Alice", "hash", true, null, null)));

        PageResponse<ObjectSubmissionDto> response = submissionService.listByUserPage(7L, 0, 24);

        assertEquals(1, response.content().size());
        assertEquals("BUG_REPORT", response.content().get(0).submissionType());
        assertEquals("Alice", response.content().get(0).submitterName());
    }

    @Test
    void listByUserPage_returnsEmptyPageWhenUserHasNoSubmissions() {
        when(submissionRepository.countBySubmittedByUserId(7L)).thenReturn(0L);
        when(submissionRepository.findPageBySubmittedByUserId(7L, 24, 0))
                .thenReturn(List.of());

        PageResponse<ObjectSubmissionDto> response = submissionService.listByUserPage(7L, 0, 24);

        assertTrue(response.content().isEmpty());
        assertEquals(0L, response.totalElements());
        verify(userRepository, never()).findAllById(any());
    }

    @Test
    void reject_rejectsAlreadyReviewedSubmission() {
        ObjectSubmissionEntity reviewed = new ObjectSubmissionEntity(
                5L, 2L, "FEEDBACK", "Name", null, null, null, null, null,
                null, null, null, null, null, null, "REJECTED", OffsetDateTime.now(),
                99L, OffsetDateTime.now(), "duplicate", null);
        when(submissionRepository.findById(5L)).thenReturn(Optional.of(reviewed));

        assertThrows(SubmissionAlreadyReviewedException.class,
                () -> submissionService.reject(5L, 99L, "again"));
    }

    @Test
    void submit_rejectsInvalidCategoryId() {
        when(categoryRepository.existsById(99L)).thenReturn(false);

        SubmissionBody body = new SubmissionBody(
                "FEEDBACK", "Name", null, null, null, null, null,
                null, null, null, 99L, null, null);

        assertThrows(CategoryNotFoundException.class, () -> submissionService.submit(7L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void submit_rejectsSeriesWithoutBrand() {
        SubmissionBody body = new SubmissionBody(
                "MISSING_MODEL", "Name", null, null, null, null, null,
                null, null, 10L, null, null, null);

        assertThrows(ValidationException.class, () -> submissionService.submit(7L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void submit_throwsWhenSeriesNotFound() {
        when(seriesRepository.findById(10L)).thenReturn(Optional.empty());

        SubmissionBody body = new SubmissionBody(
                "MISSING_MODEL", "Name", null, null, null, null, null,
                2L, null, 10L, null, null, null);

        assertThrows(SeriesNotFoundException.class, () -> submissionService.submit(7L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void submit_rejectsSeriesBrandMismatch() {
        when(seriesRepository.findById(10L)).thenReturn(Optional.of(new SeriesEntity(10L, 1L, "S", null)));

        SubmissionBody body = new SubmissionBody(
                "MISSING_MODEL", "Name", null, null, null, null, null,
                2L, null, 10L, null, null, null);

        assertThrows(ValidationException.class, () -> submissionService.submit(7L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void submit_rejectsInvalidScaleId() {
        when(scaleRepository.existsById(5L)).thenReturn(false);

        SubmissionBody body = new SubmissionBody(
                "FEEDBACK", "Name", null, null, null, null, null,
                null, null, null, null, 5L, null);

        assertThrows(ScaleNotFoundException.class, () -> submissionService.submit(7L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void approve_bugReportSkipsBrandObjectCreation() {
        ObjectSubmissionEntity pending = pendingSubmission(1L, 2L, "BUG_REPORT");
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(submissionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                new UserEntity(2L, "Bob", "hash", true, null, null)));

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                null, null, null, null, "fixed");

        ObjectSubmissionDto dto = submissionService.approve(1L, 99L, body);

        assertEquals("APPROVED", dto.status());
        assertEquals("fixed", dto.adminNote());
        verifyNoInteractions(brandService);
    }

    @Test
    void listByStatusPage_clampsOversizedPageSize() {
        when(submissionRepository.countByStatusFilter(eq("PENDING"))).thenReturn(0L);
        when(submissionRepository.findPageByStatus(eq("PENDING"), eq(100), eq(0)))
                .thenReturn(List.of());

        PageResponse<ObjectSubmissionDto> response =
                submissionService.listByStatusPage("PENDING", 0, 500);

        assertEquals(100, response.size());
        verify(submissionRepository).findPageByStatus("PENDING", 100, 0);
    }

    @Test
    void approve_rejectsInvalidCategoryId() {
        when(categoryRepository.existsById(99L)).thenReturn(false);

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                null, null, 99L, null, null);

        assertThrows(CategoryNotFoundException.class,
                () -> submissionService.approve(1L, 99L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void approve_rejectsInvalidScaleId() {
        when(scaleRepository.existsById(5L)).thenReturn(false);

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                null, null, null, 5L, null);

        assertThrows(ScaleNotFoundException.class,
                () -> submissionService.approve(1L, 99L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void approve_rejectsSeriesBrandMismatch() {
        when(seriesRepository.findById(10L)).thenReturn(Optional.of(new SeriesEntity(10L, 1L, "S", null)));

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                2L, 10L, null, null, null);

        assertThrows(ValidationException.class, () -> submissionService.approve(1L, 99L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void approve_rejectsSeriesWithoutBrand() {
        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                null, 10L, null, null, null);

        assertThrows(ValidationException.class, () -> submissionService.approve(1L, 99L, body));
        verify(submissionRepository, never()).save(any());
        verifyNoInteractions(seriesRepository);
    }

    @Test
    void approve_throwsWhenSeriesNotFound() {
        when(seriesRepository.findById(10L)).thenReturn(Optional.empty());

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                2L, 10L, null, null, null);

        assertThrows(SeriesNotFoundException.class,
                () -> submissionService.approve(1L, 99L, body));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void approve_throwsWhenNotFound() {
        when(submissionRepository.findById(99L)).thenReturn(Optional.empty());

        ApprovalBody body = new ApprovalBody(
                null, null, null, null, null, null, null,
                null, null, null, null, null);

        assertThrows(NoSuchElementException.class,
                () -> submissionService.approve(99L, 1L, body));
    }

    @Test
    void reject_throwsWhenNotFound() {
        when(submissionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> submissionService.reject(99L, 1L, "duplicate"));
        verify(submissionRepository, never()).save(any());
    }

    private static ObjectSubmissionEntity pendingSubmission(long id, long userId, String type) {
        return new ObjectSubmissionEntity(
                id, userId, type, "Name", null, null, null, null, null,
                null, null, null, null, null, null, "PENDING", OffsetDateTime.now(),
                null, null, null, null);
    }
}
