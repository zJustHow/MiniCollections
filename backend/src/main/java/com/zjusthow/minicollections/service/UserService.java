package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.exception.EmailExistsException;
import com.zjusthow.minicollections.exception.UserNotFoundException;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import com.zjusthow.minicollections.model.UserProfileDto;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsManager userDetailsManager;


    public UserService(
            GroupRepository groupRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserDetailsManager userDetailsManager) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsManager = userDetailsManager;
    }


    @Transactional
    public void signUp(String email, String password, String name) {
        email = email.toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailExistsException("Email already registered");
        }

        UserDetails user = User.builder()
                .username(email)
                .password(passwordEncoder.encode(password))
                .roles("USER")
                .build();
        userDetailsManager.createUser(user);
        userRepository.updateNameByEmail(email, name);

        UserEntity savedUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());
        GroupEntity group = new GroupEntity(null, savedUser.id(), "default", null);
        groupRepository.save(group);
    }


    @Cacheable(value = "users", key = "#email")
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());
    }

    public UserProfileDto getProfile(String email) {
        UserEntity u = getUserByEmail(email);
        return new UserProfileDto(u.id(), u.email(), u.name(), u.preferredLocale(), u.avatarUrl());
    }

    @Transactional
    @CacheEvict(value = "users", key = "#email", beforeInvocation = true)
    public UserProfileDto updatePreferredLocale(String email, String preferredLocale) {
        String e = email.toLowerCase();
        userRepository.updatePreferredLocaleByEmail(e, preferredLocale.strip());
        return getProfile(e);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#email", beforeInvocation = true)
    public UserProfileDto updateAvatarUrl(String email, String avatarUrl) {
        String e = email.toLowerCase();
        userRepository.updateAvatarUrlByEmail(e, avatarUrl);
        return getProfile(e);
    }

}
