package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.GroupEntity;
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
            ORDER BY id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<GroupEntity> findPageByUserId(
            @Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
            SELECT COUNT(*) FROM groups
            WHERE user_id = :userId AND name ILIKE '%' || :keyword || '%'
            """)
    long countSearchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    @Query("""
            SELECT * FROM groups
            WHERE user_id = :userId AND name ILIKE '%' || :keyword || '%'
            ORDER BY id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<GroupEntity> searchPageByKeyword(
            @Param("userId") Long userId,
            @Param("keyword") String keyword,
            @Param("limit") int limit,
            @Param("offset") int offset);
}
