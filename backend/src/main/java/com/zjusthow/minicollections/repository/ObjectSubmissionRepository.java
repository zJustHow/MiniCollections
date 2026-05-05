package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface ObjectSubmissionRepository extends ListCrudRepository<ObjectSubmissionEntity, Long> {
    List<ObjectSubmissionEntity> findByStatus(String status);
    List<ObjectSubmissionEntity> findBySubmittedByUserId(Long userId);
}
