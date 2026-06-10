package com.zjusthow.minicollections.repository;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SortOrderBatchRepository {

    private final JdbcClient jdbcClient;

    public SortOrderBatchRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public void updateGroupSortOrders(long userId, List<Long> orderedIds) {
        if (orderedIds.isEmpty()) {
            return;
        }
        var spec = jdbcClient.sql(buildGroupUpdateSql(orderedIds.size())).param("userId", userId);
        bindOrderedIds(spec, orderedIds).update();
    }

    public void updateUserObjectSortOrders(long groupId, List<Long> orderedIds) {
        if (orderedIds.isEmpty()) {
            return;
        }
        var spec = jdbcClient.sql(buildUserObjectUpdateSql(orderedIds.size())).param("groupId", groupId);
        bindOrderedIds(spec, orderedIds).update();
    }

    private static JdbcClient.StatementSpec bindOrderedIds(JdbcClient.StatementSpec spec, List<Long> orderedIds) {
        JdbcClient.StatementSpec bound = spec;
        for (int i = 0; i < orderedIds.size(); i++) {
            bound = bound.param("id" + i, orderedIds.get(i)).param("ord" + i, i);
        }
        return bound;
    }

    private static String buildGroupUpdateSql(int count) {
        return """
                UPDATE groups g
                SET sort_order = v.ord
                FROM (%s) AS v(id, ord)
                WHERE g.id = v.id AND g.user_id = :userId
                """.formatted(valuesClause(count));
    }

    private static String buildUserObjectUpdateSql(int count) {
        return """
                UPDATE user_objects uo
                SET sort_order = v.ord
                FROM (%s) AS v(id, ord)
                WHERE uo.id = v.id AND uo.group_id = :groupId
                """.formatted(valuesClause(count));
    }

    private static String valuesClause(int count) {
        StringBuilder values = new StringBuilder("VALUES ");
        for (int i = 0; i < count; i++) {
            if (i > 0) {
                values.append(", ");
            }
            values.append("(:id").append(i).append(", :ord").append(i).append(")");
        }
        return values.toString();
    }
}
