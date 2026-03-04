package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.GroupEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends ListCrudRepository<GroupEntity, Long> {
    Optional<List<GroupEntity>> findByName(String groupName);
    Optional<List<GroupEntity>> findByUserId(Long userId);
}