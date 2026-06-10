package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.GroupEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends ListCrudRepository<GroupEntity, Long> {
    Optional<List<GroupEntity>> findByName(String groupName);
    Optional<List<GroupEntity>> findByUserId(Long userId);

    @Query("SELECT COUNT(*) FROM groups WHERE user_id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT * FROM groups
            WHERE user_id = :userId
            ORDER BY sort_order ASC, id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<GroupEntity> findPageByUserId(
            @Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
            SELECT id FROM groups
            WHERE user_id = :userId
            ORDER BY sort_order ASC, id ASC
            """)
    List<Long> findOrderedIdsByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT COALESCE(MAX(sort_order), -1)
            FROM groups
            WHERE user_id = :userId
            """)
    int maxSortOrderByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("""
            UPDATE groups
            SET sort_order = :sortOrder
            WHERE id = :id AND user_id = :userId
            """)
    void updateSortOrder(
            @Param("id") Long id,
            @Param("userId") Long userId,
            @Param("sortOrder") int sortOrder);

    @Query("""
            SELECT COUNT(*) FROM groups
            WHERE user_id = :userId AND name ILIKE '%' || :keyword || '%'
            """)
    long countSearchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    @Query("""
            SELECT * FROM groups
            WHERE user_id = :userId AND name ILIKE '%' || :keyword || '%'
            ORDER BY sort_order ASC, id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<GroupEntity> searchPageByKeyword(
            @Param("userId") Long userId,
            @Param("keyword") String keyword,
            @Param("limit") int limit,
            @Param("offset") int offset);
}
