package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.model.BrandCountDto;
import com.zjusthow.minicollections.model.CategoryCountDto;
import com.zjusthow.minicollections.model.CollectionStatsDto;
import com.zjusthow.minicollections.model.PurchaseTrendPointDto;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CollectionStatsService {

    private static final int MAX_BRAND_BUCKETS = 30;

    private final JdbcClient jdbcClient;

    public CollectionStatsService(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public CollectionStatsDto getStats(Long userId) {
        long total = jdbcClient.sql(
                        "SELECT COUNT(*) FROM user_objects WHERE user_id = :userId")
                .param("userId", userId)
                .query(Long.class)
                .single();

        List<CategoryCountDto> byCategory = jdbcClient.sql("""
                        SELECT c.id, c.name_en, c.name_zh, COUNT(*) AS cnt
                        FROM user_objects uo
                        JOIN brand_objects bo ON uo.brand_object_id = bo.id
                        JOIN categories c ON bo.category_id = c.id
                        WHERE uo.user_id = :userId
                        GROUP BY c.id, c.name_en, c.name_zh
                        ORDER BY cnt DESC, c.id ASC
                        """)
                .param("userId", userId)
                .query((rs, rowNum) -> new CategoryCountDto(
                        rs.getLong("id"),
                        rs.getString("name_en"),
                        rs.getString("name_zh"),
                        rs.getLong("cnt")))
                .list();

        List<BrandCountDto> byBrand = jdbcClient.sql("""
                        SELECT br.id, br.name_en, br.name_zh, COUNT(*) AS cnt
                        FROM user_objects uo
                        JOIN brand_objects bo ON uo.brand_object_id = bo.id
                        JOIN brands br ON bo.brand_id = br.id
                        WHERE uo.user_id = :userId
                        GROUP BY br.id, br.name_en, br.name_zh
                        ORDER BY cnt DESC, br.id ASC
                        LIMIT :limit
                        """)
                .param("userId", userId)
                .param("limit", MAX_BRAND_BUCKETS)
                .query((rs, rowNum) -> new BrandCountDto(
                        rs.getLong("id"),
                        rs.getString("name_en"),
                        rs.getString("name_zh"),
                        rs.getLong("cnt")))
                .list();

        List<DailyPurchaseSum> dailySums = jdbcClient.sql("""
                        SELECT purchase_date, SUM(purchase_price) AS amount
                        FROM user_objects
                        WHERE user_id = :userId
                          AND purchase_date IS NOT NULL
                          AND purchase_price IS NOT NULL
                        GROUP BY purchase_date
                        ORDER BY purchase_date ASC
                        """)
                .param("userId", userId)
                .query((rs, rowNum) -> new DailyPurchaseSum(
                        rs.getObject("purchase_date", Date.class).toLocalDate(),
                        rs.getBigDecimal("amount")))
                .list();

        return new CollectionStatsDto(
                total,
                byCategory,
                byBrand,
                toCumulativeTrend(dailySums));
    }

    private static List<PurchaseTrendPointDto> toCumulativeTrend(List<DailyPurchaseSum> dailySums) {
        BigDecimal cumulative = BigDecimal.ZERO;
        List<PurchaseTrendPointDto> trend = new ArrayList<>();
        for (DailyPurchaseSum daily : dailySums) {
            cumulative = cumulative.add(daily.amount());
            trend.add(new PurchaseTrendPointDto(daily.date(), daily.amount(), cumulative));
        }
        return trend;
    }

    private record DailyPurchaseSum(LocalDate date, BigDecimal amount) {}
}
