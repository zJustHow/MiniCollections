package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.UserObjectEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserObjectRepository extends ListCrudRepository<UserObjectEntity, Long> {
    Optional<List<UserObjectEntity>> findByName(String userObjectName);

    Optional<List<UserObjectEntity>> findByUserId(Long userId);

    Optional<List<UserObjectEntity>> findByGroupId(Long groupId);

    @Query("SELECT COUNT(*) FROM user_objects WHERE group_id = :groupId")
    long countByGroupId(@Param("groupId") Long groupId);

    @Query("""
            SELECT * FROM user_objects
            WHERE group_id = :groupId
            ORDER BY sort_order ASC, id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<UserObjectEntity> findPageByGroupId(
            @Param("groupId") Long groupId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
            SELECT id FROM user_objects
            WHERE group_id = :groupId
            ORDER BY sort_order ASC, id ASC
            """)
    List<Long> findOrderedIdsByGroupId(@Param("groupId") Long groupId);

    @Query("""
            SELECT COALESCE(MAX(sort_order), -1)
            FROM user_objects
            WHERE group_id = :groupId
            """)
    int maxSortOrderByGroupId(@Param("groupId") Long groupId);

    @Modifying
    @Query("""
            UPDATE user_objects
            SET sort_order = :sortOrder
            WHERE id = :id AND group_id = :groupId
            """)
    void updateSortOrder(
            @Param("id") Long id,
            @Param("groupId") Long groupId,
            @Param("sortOrder") int sortOrder);

    /** Detach catalog model from user collections before deleting the brand object. */
    @Modifying
    @Query("UPDATE user_objects SET brand_object_id = NULL WHERE brand_object_id = :brandObjectId")
    void clearBrandObjectReference(@Param("brandObjectId") Long brandObjectId);
}
