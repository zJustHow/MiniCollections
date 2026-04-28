package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.UserIdentifierEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserIdentifierRepository extends ListCrudRepository<UserIdentifierEntity, Long> {
    Optional<UserIdentifierEntity> findByIdentifier(String identifier);
    Optional<UserIdentifierEntity> findByUserIdAndType(Long userId, String type);
    boolean existsByTypeAndIdentifier(String type, String identifier);
}
