package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.ViewCountElasticsearchSyncService;
import com.zjusthow.minicollections.entity.PageViewEventEntity;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import com.zjusthow.minicollections.exception.BrandObjectNotFoundException;
import com.zjusthow.minicollections.exception.RateLimitExceededException;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.PageViewDailyStatsRepository;
import com.zjusthow.minicollections.repository.PageViewEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class ViewCountService {

    private static final Logger log = LoggerFactory.getLogger(ViewCountService.class);
    private static final ZoneId STATS_ZONE = ZoneId.systemDefault();

    private final StringRedisTemplate redis;
    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final PageViewEventRepository pageViewEventRepository;
    private final PageViewDailyStatsRepository pageViewDailyStatsRepository;
    private final ViewCountElasticsearchSyncService viewCountElasticsearchSyncService;

    @Value("${app.view-count.dedup-minutes:30}")
    private int dedupMinutes;

    @Value("${app.view-count.rate-limit-per-visitor-per-minute:60}")
    private int rateLimitPerVisitorPerMinute;

    public ViewCountService(
            StringRedisTemplate redis,
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            PageViewEventRepository pageViewEventRepository,
            PageViewDailyStatsRepository pageViewDailyStatsRepository,
            ViewCountElasticsearchSyncService viewCountElasticsearchSyncService) {
        this.redis = redis;
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.pageViewEventRepository = pageViewEventRepository;
        this.pageViewDailyStatsRepository = pageViewDailyStatsRepository;
        this.viewCountElasticsearchSyncService = viewCountElasticsearchSyncService;
    }

    @Transactional
    public void recordBrandView(long brandId, String username, String sessionId) {
        if (!brandRepository.existsById(brandId)) {
            throw new BrandNotFoundException();
        }
        recordView("brand", brandId, username, sessionId);
    }

    @Transactional
    public void recordModelView(long modelId, String username, String sessionId) {
        if (!brandObjectRepository.existsById(modelId)) {
            throw new BrandObjectNotFoundException();
        }
        recordView("model", modelId, username, sessionId);
    }

    public long displayBrandViewCount(long brandId, long storedCount) {
        return storedCount + pendingDelta("brand", brandId);
    }

    public long displayModelViewCount(long modelId, long storedCount) {
        return storedCount + pendingDelta("model", modelId);
    }

    @Transactional
    public void flushPendingCounts() {
        ScanOptions options = ScanOptions.scanOptions()
                .match(ViewCountKeys.PENDING_PREFIX + "*")
                .count(100)
                .build();
        try (Cursor<String> cursor = redis.scan(options)) {
            while (cursor.hasNext()) {
                flushPendingKey(cursor.next());
            }
        }
    }

    @Transactional
    public long purgeEventsOlderThanDays(int retentionDays) {
        Instant cutoff = Instant.now().minus(Duration.ofDays(retentionDays));
        return pageViewEventRepository.deleteOlderThan(cutoff);
    }

    private void recordView(String kind, long id, String username, String sessionId) {
        String visitorKey = ViewCountKeys.resolveVisitorKey(username, sessionId).orElse(null);
        if (visitorKey == null) {
            return;
        }
        if (!acquireRateLimit(visitorKey)) {
            throw new RateLimitExceededException();
        }
        String dedupKey = ViewCountKeys.dedupKey(kind, id, visitorKey);
        Boolean accepted = redis.opsForValue().setIfAbsent(
                dedupKey, "1", dedupMinutes, TimeUnit.MINUTES);
        if (!Boolean.TRUE.equals(accepted)) {
            return;
        }
        redis.opsForValue().increment(ViewCountKeys.pendingKey(kind, id));
        persistViewAnalytics(kind, id, visitorKey);
    }

    private void persistViewAnalytics(String kind, long id, String visitorKey) {
        String entityType = ViewCountKeys.entityType(kind);
        try {
            pageViewEventRepository.save(new PageViewEventEntity(
                    null, entityType, id, visitorKey, Instant.now()));
        } catch (Exception e) {
            log.warn("Failed to persist page view event for {}:{}: {}", entityType, id, e.getMessage());
        }
        long uvDelta = countDailyUniqueVisitor(entityType, id, visitorKey) ? 1L : 0L;
        try {
            pageViewDailyStatsRepository.upsertToday(entityType, id, uvDelta);
        } catch (Exception e) {
            log.warn("Failed to upsert daily view stats for {}:{}: {}", entityType, id, e.getMessage());
        }
    }

    private boolean acquireRateLimit(String visitorKey) {
        String key = ViewCountKeys.rateLimitKey(visitorKey);
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redis.expire(key, 1, TimeUnit.MINUTES);
        }
        return count != null && count <= rateLimitPerVisitorPerMinute;
    }

    private boolean countDailyUniqueVisitor(String entityType, long id, String visitorKey) {
        LocalDate today = LocalDate.now(STATS_ZONE);
        String dailyUvKey = ViewCountKeys.dailyUvKey(entityType, id, today, visitorKey);
        Duration ttl = Duration.between(
                ZonedDateTime.now(STATS_ZONE),
                today.plusDays(1).atStartOfDay(STATS_ZONE).plusHours(1));
        long ttlSeconds = Math.max(ttl.getSeconds(), 60L);
        Boolean firstToday = redis.opsForValue().setIfAbsent(
                dailyUvKey, "1", ttlSeconds, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(firstToday);
    }

    private long pendingDelta(String kind, long id) {
        String pending = redis.opsForValue().get(ViewCountKeys.pendingKey(kind, id));
        if (pending == null || pending.isBlank()) {
            return 0L;
        }
        try {
            return Long.parseLong(pending);
        } catch (NumberFormatException e) {
            log.warn("Invalid pending view count for {}:{} value={}", kind, id, pending);
            return 0L;
        }
    }

    private void flushPendingKey(String key) {
        String value = redis.opsForValue().getAndDelete(key);
        if (value == null || value.isBlank()) {
            return;
        }
        long delta;
        try {
            delta = Long.parseLong(value);
        } catch (NumberFormatException e) {
            log.warn("Skipping invalid pending view count for key={} value={}", key, value);
            return;
        }
        if (delta <= 0) {
            return;
        }
        ViewCountKeys.parsePendingKey(key).ifPresent(parsed -> {
            if ("brand".equals(parsed.kind())) {
                brandRepository.incrementViewCount(parsed.id(), delta);
                viewCountElasticsearchSyncService.syncBrandViewCount(parsed.id());
            } else {
                brandObjectRepository.incrementViewCount(parsed.id(), delta);
                viewCountElasticsearchSyncService.syncModelViewCount(parsed.id());
            }
        });
    }
}
