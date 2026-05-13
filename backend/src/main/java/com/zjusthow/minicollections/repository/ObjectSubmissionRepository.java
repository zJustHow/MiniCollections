package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface ObjectSubmissionRepository extends ListCrudRepository<ObjectSubmissionEntity, Long> {
    List<ObjectSubmissionEntity> findByStatus(String status);
    List<ObjectSubmissionEntity> findBySubmittedByUserId(Long userId);

    @Query("SELECT COUNT(*) FROM object_submissions WHERE submitted_by_user_id = :userId AND submitted_at >= :since")
    int countBySubmittedByUserIdAndSubmittedAtAfter(Long userId, OffsetDateTime since);
}
