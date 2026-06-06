package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface ObjectSubmissionRepository extends ListCrudRepository<ObjectSubmissionEntity, Long> {
    List<ObjectSubmissionEntity> findByStatus(String status);
    List<ObjectSubmissionEntity> findBySubmittedByUserId(Long userId);

    @Query("SELECT COUNT(*) FROM object_submissions WHERE submitted_by_user_id = :userId")
    long countBySubmittedByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT * FROM object_submissions
            WHERE submitted_by_user_id = :userId
            ORDER BY submitted_at DESC, id DESC
            LIMIT :limit OFFSET :offset
            """)
    List<ObjectSubmissionEntity> findPageBySubmittedByUserId(
            @Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("SELECT COUNT(*) FROM object_submissions WHERE submitted_by_user_id = :userId AND submitted_at >= :since")
    int countBySubmittedByUserIdAndSubmittedAtAfter(Long userId, OffsetDateTime since);
}
