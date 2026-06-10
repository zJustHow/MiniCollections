package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.model.BrandCountDto;
import com.zjusthow.minicollections.model.CategoryCountDto;
import com.zjusthow.minicollections.model.CollectionStatsDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CollectionStatsServiceTest {

    @Mock JdbcClient jdbcClient;

    @InjectMocks CollectionStatsService collectionStatsService;

    @Test
    void getStats_buildsCumulativePurchaseTrend() throws Exception {
        when(jdbcClient.sql(anyString())).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0, String.class);
            if (sql.contains("COUNT(*) FROM user_objects")) {
                return countSpec(5L);
            }
            if (sql.contains("categories c")) {
                return listSpec(List.of());
            }
            if (sql.contains("brands br")) {
                return limitListSpec(List.of());
            }
            if (sql.contains("purchase_date")) {
                return mappedListSpec(List.of(
                        dailyRow(LocalDate.of(2024, 1, 1), new BigDecimal("100.00")),
                        dailyRow(LocalDate.of(2024, 2, 1), new BigDecimal("50.00"))));
            }
            throw new IllegalStateException("Unexpected SQL: " + sql);
        });

        CollectionStatsDto stats = collectionStatsService.getStats(1L);

        assertEquals(5L, stats.totalObjects());
        assertEquals(2, stats.purchaseTrend().size());
        assertEquals(new BigDecimal("100.00"), stats.purchaseTrend().get(0).cumulativeTotal());
        assertEquals(new BigDecimal("150.00"), stats.purchaseTrend().get(1).cumulativeTotal());
    }

    @Test
    void getStats_includesCategoryAndBrandBreakdown() {
        when(jdbcClient.sql(anyString())).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0, String.class);
            if (sql.contains("COUNT(*) FROM user_objects")) {
                return countSpec(3L);
            }
            if (sql.contains("categories c")) {
                return listSpec(List.of(new CategoryCountDto(1L, "Cars", "汽车", 2L)));
            }
            if (sql.contains("brands br")) {
                return limitListSpec(List.of(new BrandCountDto(9L, "BMW", "宝马", 2L)));
            }
            if (sql.contains("purchase_date")) {
                return mappedListSpec(List.of());
            }
            throw new IllegalStateException("Unexpected SQL: " + sql);
        });

        CollectionStatsDto stats = collectionStatsService.getStats(1L);

        assertEquals(3L, stats.totalObjects());
        assertEquals(1, stats.byCategory().size());
        assertEquals("Cars", stats.byCategory().get(0).nameEn());
        assertEquals(1, stats.byBrand().size());
        assertEquals("BMW", stats.byBrand().get(0).nameEn());
        assertTrue(stats.purchaseTrend().isEmpty());
    }

    private static ResultSet dailyRow(LocalDate date, BigDecimal amount) throws Exception {
        ResultSet rs = mock(ResultSet.class);
        when(rs.getObject("purchase_date", Date.class)).thenReturn(Date.valueOf(date));
        when(rs.getBigDecimal("amount")).thenReturn(amount);
        return rs;
    }

    @SuppressWarnings("unchecked")
    private JdbcClient.StatementSpec countSpec(long total) {
        JdbcClient.StatementSpec spec = mock(JdbcClient.StatementSpec.class);
        JdbcClient.MappedQuerySpec<Long> countQuery = mock(JdbcClient.MappedQuerySpec.class);
        when(spec.param(anyString(), any())).thenReturn(spec);
        when(spec.query(Long.class)).thenReturn(countQuery);
        when(countQuery.single()).thenReturn(total);
        return spec;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private JdbcClient.StatementSpec listSpec(List<?> rows) {
        JdbcClient.StatementSpec spec = mock(JdbcClient.StatementSpec.class);
        JdbcClient.MappedQuerySpec listQuery = mock(JdbcClient.MappedQuerySpec.class);
        when(spec.param(anyString(), any())).thenReturn(spec);
        when(spec.query(any(RowMapper.class))).thenReturn(listQuery);
        when(listQuery.list()).thenReturn(rows);
        return spec;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private JdbcClient.StatementSpec limitListSpec(List<?> rows) {
        JdbcClient.StatementSpec spec = mock(JdbcClient.StatementSpec.class);
        JdbcClient.MappedQuerySpec listQuery = mock(JdbcClient.MappedQuerySpec.class);
        when(spec.param(anyString(), any())).thenReturn(spec);
        when(spec.param(anyString(), any(Integer.class))).thenReturn(spec);
        when(spec.query(any(RowMapper.class))).thenReturn(listQuery);
        when(listQuery.list()).thenReturn(rows);
        return spec;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private JdbcClient.StatementSpec mappedListSpec(List<ResultSet> rows) {
        JdbcClient.StatementSpec spec = mock(JdbcClient.StatementSpec.class);
        when(spec.param(anyString(), any())).thenReturn(spec);
        when(spec.query(any(RowMapper.class))).thenAnswer(invocation -> {
            RowMapper mapper = invocation.getArgument(0);
            JdbcClient.MappedQuerySpec listQuery = mock(JdbcClient.MappedQuerySpec.class);
            try {
                List<Object> mapped = new ArrayList<>();
                for (int i = 0; i < rows.size(); i++) {
                    mapped.add(mapper.mapRow(rows.get(i), i));
                }
                when(listQuery.list()).thenReturn(mapped);
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
            return listQuery;
        });
        return spec;
    }
}
