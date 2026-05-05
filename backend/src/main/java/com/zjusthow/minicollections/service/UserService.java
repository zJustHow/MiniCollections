package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.entity.UserIdentifierEntity;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.UserNotFoundException;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.UserIdentifierRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import com.zjusthow.minicollections.model.UserProfileDto;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final UserIdentifierRepository identifierRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbc;

    public UserService(
            GroupRepository groupRepository,
            UserRepository userRepository,
            UserIdentifierRepository identifierRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbc) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.identifierRepository = identifierRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbc = jdbc;
    }

    @Transactional
    public Long signUp(String email, String phone, String password, String name, String preferredLocale) {
        final String normalizedEmail = (email != null && !email.isBlank()) ? email.toLowerCase().strip() : null;
        final String normalizedPhone = (phone != null && !phone.isBlank()) ? phone.strip() : null;

        if (normalizedEmail == null && normalizedPhone == null) {
            throw new IllegalArgumentException("Email or phone is required");
        }

        if (normalizedEmail != null) {
            if (identifierRepository.existsByTypeAndIdentifier("email", normalizedEmail)) {
                throw new IdentifierExistsException("Email already registered");
            }
        }

        if (normalizedPhone != null) {
            if (identifierRepository.existsByTypeAndIdentifier("phone", normalizedPhone)) {
                throw new IdentifierExistsException("Phone already registered");
            }
        }

        String locale = (preferredLocale != null && !preferredLocale.isBlank()) ? preferredLocale.strip() : "en-US";
        UserEntity user = userRepository.save(
                new UserEntity(null, name, passwordEncoder.encode(password), true, locale, null));

        if (normalizedEmail != null) {
            identifierRepository.save(new UserIdentifierEntity(null, user.id(), "email", normalizedEmail));
        }
        if (normalizedPhone != null) {
            identifierRepository.save(new UserIdentifierEntity(null, user.id(), "phone", normalizedPhone));
        }

        jdbc.update("INSERT INTO authorities (user_id, authority) VALUES (?, ?)", user.id(), "ROLE_USER");
        groupRepository.save(new GroupEntity(null, user.id(), "default", null));

        return user.id();
    }

    @Cacheable(value = "users", key = "#id")
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(UserNotFoundException::new);
    }

    public UserProfileDto getProfile(Long userId) {
        UserEntity u = getUserById(userId);
        String email = identifierRepository.findByUserIdAndType(userId, "email")
                .map(UserIdentifierEntity::identifier)
                .orElse(null);
        String phone = identifierRepository.findByUserIdAndType(userId, "phone")
                .map(UserIdentifierEntity::identifier)
                .orElse(null);
        boolean isAdmin = Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                Boolean.class, userId));
        return new UserProfileDto(u.id(), email, phone, u.displayName(), u.preferredLocale(), u.avatarUrl(), isAdmin);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId", beforeInvocation = true)
    public UserProfileDto updatePreferredLocale(Long userId, String preferredLocale) {
        userRepository.updatePreferredLocaleById(userId, preferredLocale.strip());
        return getProfile(userId);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId", beforeInvocation = true)
    public UserProfileDto updateAvatarUrl(Long userId, String avatarUrl) {
        userRepository.updateAvatarUrlById(userId, avatarUrl);
        return getProfile(userId);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId", beforeInvocation = true)
    public UserProfileDto updateDisplayName(Long userId, String displayName) {
        userRepository.updateDisplayNameById(userId, displayName.strip());
        return getProfile(userId);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId", beforeInvocation = true)
    public UserProfileDto updatePassword(Long userId, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        if (!passwordEncoder.matches(currentPassword, user.password())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        userRepository.updatePasswordById(userId, passwordEncoder.encode(newPassword));
        return getProfile(userId);
    }

    @Transactional
    public void grantAdminRole(Long userId) {
        jdbc.update("INSERT INTO authorities (user_id, authority) VALUES (?, ?)", userId, "ROLE_ADMIN");
    }

    @Transactional
    public UserProfileDto updateIdentifier(Long userId, String type, String identifier) {
        final String normalized = identifier.strip().toLowerCase();
        if (identifierRepository.existsByTypeAndIdentifier(type, normalized)) {
            throw new IdentifierExistsException(type + " already in use");
        }
        identifierRepository.findByUserIdAndType(userId, type)
                .ifPresentOrElse(
                        existing -> identifierRepository.save(
                                new UserIdentifierEntity(existing.id(), userId, type, normalized)),
                        () -> identifierRepository.save(
                                new UserIdentifierEntity(null, userId, type, normalized))
                );
        return getProfile(userId);
    }
}
