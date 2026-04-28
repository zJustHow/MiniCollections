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
    public Long signUp(String email, String password, String name) {
        email = email.toLowerCase();

        if (identifierRepository.existsByTypeAndIdentifier("email", email)) {
            throw new IdentifierExistsException("Email already registered");
        }

        UserEntity user = userRepository.save(
                new UserEntity(null, name, passwordEncoder.encode(password), true, "en-US", null));

        identifierRepository.save(new UserIdentifierEntity(null, user.id(), "email", email));
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
        return new UserProfileDto(u.id(), email, u.displayName(), u.preferredLocale(), u.avatarUrl());
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
}
