package com.zjusthow.minicollections.repository;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Testcontainers(disabledWithoutDocker = true)
class SortOrderBatchRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    static JdbcClient jdbcClient;
    static SortOrderBatchRepository repository;

    @BeforeAll
    static void setUpSchema() {
        postgres.start();
        SimpleDriverDataSource dataSource = new SimpleDriverDataSource();
        dataSource.setUrl(postgres.getJdbcUrl());
        dataSource.setUsername(postgres.getUsername());
        dataSource.setPassword(postgres.getPassword());
        jdbcClient = JdbcClient.create(dataSource);
        jdbcClient.sql("""
                CREATE TABLE groups (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    sort_order INT NOT NULL DEFAULT 0
                )
                """).update();
        jdbcClient.sql("""
                CREATE TABLE user_objects (
                    id BIGSERIAL PRIMARY KEY,
                    group_id BIGINT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    sort_order INT NOT NULL DEFAULT 0
                )
                """).update();
        repository = new SortOrderBatchRepository(jdbcClient);
    }

    @BeforeEach
    void cleanTables() {
        jdbcClient.sql("TRUNCATE groups RESTART IDENTITY").update();
        jdbcClient.sql("TRUNCATE user_objects RESTART IDENTITY").update();
    }

    @Test
    void updateGroupSortOrders_appliesAllOrdersInOneStatement() {
        jdbcClient.sql("""
                INSERT INTO groups (id, user_id, name, sort_order) VALUES
                (1, 10, 'A', 0),
                (2, 10, 'B', 1),
                (3, 10, 'C', 2)
                """).update();

        repository.updateGroupSortOrders(10L, List.of(3L, 1L, 2L));

        assertEquals(0, sortOrderForGroup(3L));
        assertEquals(1, sortOrderForGroup(1L));
        assertEquals(2, sortOrderForGroup(2L));
    }

    @Test
    void updateUserObjectSortOrders_appliesAllOrdersInOneStatement() {
        jdbcClient.sql("""
                INSERT INTO user_objects (id, group_id, name, sort_order) VALUES
                (10, 5, 'A', 0),
                (11, 5, 'B', 1),
                (12, 5, 'C', 2)
                """).update();

        repository.updateUserObjectSortOrders(5L, List.of(12L, 10L, 11L));

        assertEquals(0, sortOrderForUserObject(12L));
        assertEquals(1, sortOrderForUserObject(10L));
        assertEquals(2, sortOrderForUserObject(11L));
    }

    private static int sortOrderForGroup(long id) {
        return jdbcClient.sql("SELECT sort_order FROM groups WHERE id = :id")
                .param("id", id)
                .query(Integer.class)
                .single();
    }

    private static int sortOrderForUserObject(long id) {
        return jdbcClient.sql("SELECT sort_order FROM user_objects WHERE id = :id")
                .param("id", id)
                .query(Integer.class)
                .single();
    }
}
