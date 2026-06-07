package com.zjusthow.minicollections.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PageViewDailyStatsRepository {

    private final JdbcTemplate jdbc;

    public PageViewDailyStatsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void upsertToday(String entityType, long entityId, long uvDelta) {
        jdbc.update("""
                INSERT INTO page_view_daily_stats (entity_type, entity_id, stat_date, pv, uv)
                VALUES (?, ?, CURRENT_DATE, 1, ?)
                ON CONFLICT (entity_type, entity_id, stat_date)
                DO UPDATE SET
                    pv = page_view_daily_stats.pv + 1,
                    uv = page_view_daily_stats.uv + ?
                """,
                entityType, entityId, uvDelta, uvDelta);
    }
}
