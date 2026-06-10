package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.ViewCountElasticsearchSyncService;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import com.zjusthow.minicollections.exception.BrandObjectNotFoundException;
import com.zjusthow.minicollections.exception.RateLimitExceededException;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.PageViewDailyStatsRepository;
import com.zjusthow.minicollections.repository.PageViewEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ViewCountServiceTest {

    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> valueOps;
    @Mock BrandRepository brandRepository;
    @Mock BrandObjectRepository brandObjectRepository;
    @Mock PageViewEventRepository pageViewEventRepository;
    @Mock PageViewDailyStatsRepository pageViewDailyStatsRepository;
    @Mock ViewCountElasticsearchSyncService viewCountElasticsearchSyncService;

    @InjectMocks ViewCountService viewCountService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(viewCountService, "dedupMinutes", 30);
        ReflectionTestUtils.setField(viewCountService, "rateLimitPerVisitorPerMinute", 60);
    }

    @Test
    void recordBrandView_throwsWhenBrandMissing() {
        when(brandRepository.existsById(9L)).thenReturn(false);

        assertThrows(BrandNotFoundException.class,
                () -> viewCountService.recordBrandView(9L, null, "session-1"));
    }

    @Test
    void recordModelView_throwsWhenModelMissing() {
        when(brandObjectRepository.existsById(8L)).thenReturn(false);

        assertThrows(BrandObjectNotFoundException.class,
                () -> viewCountService.recordModelView(8L, "alice", null));
    }

    @Test
    void recordBrandView_skipsWhenNoVisitorIdentity() {
        when(brandRepository.existsById(3L)).thenReturn(true);

        viewCountService.recordBrandView(3L, null, null);

        verifyNoInteractions(redis);
    }

    @Test
    void recordBrandView_incrementsPendingForAnonymousSession() {
        when(brandRepository.existsById(3L)).thenReturn(true);
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(ViewCountKeys.rateLimitKey("anon:session-1"))).thenReturn(1L);
        when(valueOps.setIfAbsent(
                eq(ViewCountKeys.dedupKey("brand", 3, "anon:session-1")),
                eq("1"),
                eq(30L),
                eq(TimeUnit.MINUTES)))
                .thenReturn(true);
        when(valueOps.setIfAbsent(anyString(), eq("1"), anyLong(), eq(TimeUnit.SECONDS)))
                .thenReturn(true);

        viewCountService.recordBrandView(3L, null, "session-1");

        verify(valueOps).increment(ViewCountKeys.pendingKey("brand", 3));
        verify(pageViewEventRepository).save(any());
        verify(pageViewDailyStatsRepository).upsertToday("BRAND", 3L, 1L);
    }

    @Test
    void recordBrandView_throwsWhenRateLimitExceeded() {
        when(brandRepository.existsById(3L)).thenReturn(true);
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(ViewCountKeys.rateLimitKey("anon:session-1"))).thenReturn(61L);

        assertThrows(RateLimitExceededException.class,
                () -> viewCountService.recordBrandView(3L, null, "session-1"));

        verify(valueOps, never()).setIfAbsent(
                eq(ViewCountKeys.dedupKey("brand", 3, "anon:session-1")),
                anyString(),
                anyLong(),
                eq(TimeUnit.MINUTES));
    }

    @Test
    void recordBrandView_skipsWhenDedupRejected() {
        when(brandRepository.existsById(3L)).thenReturn(true);
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(ViewCountKeys.rateLimitKey("user:alice"))).thenReturn(1L);
        when(valueOps.setIfAbsent(
                eq(ViewCountKeys.dedupKey("brand", 3, "user:alice")),
                eq("1"),
                eq(30L),
                eq(TimeUnit.MINUTES)))
                .thenReturn(false);

        viewCountService.recordBrandView(3L, "alice", null);

        verify(valueOps).increment(ViewCountKeys.rateLimitKey("user:alice"));
        verify(valueOps, never()).increment(ViewCountKeys.pendingKey("brand", 3));
        verifyNoInteractions(pageViewEventRepository);
    }

    @Test
    void displayBrandViewCount_addsPendingDelta() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(ViewCountKeys.pendingKey("brand", 5))).thenReturn("3");

        assertEquals(13L, viewCountService.displayBrandViewCount(5L, 10L));
    }

    @Test
    void displayModelViewCount_returnsStoredWhenNoPending() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(ViewCountKeys.pendingKey("model", 8))).thenReturn(null);

        assertEquals(42L, viewCountService.displayModelViewCount(8L, 42L));
    }

    @Test
    void purgeEventsOlderThanDays_delegatesToRepository() {
        when(pageViewEventRepository.deleteOlderThan(any(Instant.class))).thenReturn(17L);

        long deleted = viewCountService.purgeEventsOlderThanDays(90);

        assertEquals(17L, deleted);
        verify(pageViewEventRepository).deleteOlderThan(any(Instant.class));
    }

    @Test
    void flushPendingCounts_writesBrandDeltaToDatabase() {
        @SuppressWarnings("unchecked")
        Cursor<String> cursor = org.mockito.Mockito.mock(Cursor.class);
        when(redis.scan(org.mockito.ArgumentMatchers.any(ScanOptions.class))).thenReturn(cursor);
        when(cursor.hasNext()).thenReturn(true, false);
        when(cursor.next()).thenReturn(ViewCountKeys.pendingKey("brand", 5));
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.getAndDelete(ViewCountKeys.pendingKey("brand", 5))).thenReturn("2");

        viewCountService.flushPendingCounts();

        verify(brandRepository).incrementViewCount(5L, 2L);
        verify(viewCountElasticsearchSyncService).syncBrandViewCount(5L);
    }

    @Test
    void flushPendingCounts_writesModelDeltaToDatabase() {
        @SuppressWarnings("unchecked")
        Cursor<String> cursor = org.mockito.Mockito.mock(Cursor.class);
        when(redis.scan(org.mockito.ArgumentMatchers.any(ScanOptions.class))).thenReturn(cursor);
        when(cursor.hasNext()).thenReturn(true, false);
        when(cursor.next()).thenReturn(ViewCountKeys.pendingKey("model", 8));
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.getAndDelete(ViewCountKeys.pendingKey("model", 8))).thenReturn("4");

        viewCountService.flushPendingCounts();

        verify(brandObjectRepository).incrementViewCount(8L, 4L);
        verify(viewCountElasticsearchSyncService).syncModelViewCount(8L);
    }
}
