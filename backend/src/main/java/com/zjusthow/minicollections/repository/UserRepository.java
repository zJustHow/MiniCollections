package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.UserEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends ListCrudRepository<UserEntity, Long> {

    @Modifying
    @Query("UPDATE users SET preferred_locale = :preferredLocale WHERE id = :id")
    void updatePreferredLocaleById(Long id, String preferredLocale);

    @Modifying
    @Query("UPDATE users SET avatar_url = :avatarUrl WHERE id = :id")
    void updateAvatarUrlById(Long id, String avatarUrl);
}
