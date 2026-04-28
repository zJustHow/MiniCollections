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

    @Modifying
    @Query("UPDATE users SET display_name = :displayName WHERE id = :id")
    void updateDisplayNameById(Long id, String displayName);

    @Modifying
    @Query("UPDATE users SET password = :password WHERE id = :id")
    void updatePasswordById(Long id, String password);
}
