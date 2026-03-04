package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.UserEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends ListCrudRepository<UserEntity, Long> {
    Optional<List<UserEntity>> findByName(String userName);
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String emal);

    @Modifying
    @Query("UPDATE users SET name = :name WHERE email = :email")
    void updateNameByEmail(String email, String name);
}