package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.UserObjectEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserObjectRepository extends ListCrudRepository<UserObjectEntity, Long> {
    Optional<List<UserObjectEntity>> findByName(String userObjectName);

    Optional<List<UserObjectEntity>> findByUserId(Long userId);

    Optional<List<UserObjectEntity>> findByGroupId(Long groupId);
}