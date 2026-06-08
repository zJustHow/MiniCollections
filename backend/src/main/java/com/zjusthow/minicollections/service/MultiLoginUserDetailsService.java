package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.entity.UserIdentifierEntity;
import com.zjusthow.minicollections.repository.UserIdentifierRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MultiLoginUserDetailsService implements UserDetailsService {

    private final UserIdentifierRepository identifierRepo;
    private final UserRepository userRepo;
    private final JdbcTemplate jdbc;

    public MultiLoginUserDetailsService(
            UserIdentifierRepository identifierRepo,
            UserRepository userRepo,
            JdbcTemplate jdbc) {
        this.identifierRepo = identifierRepo;
        this.userRepo = userRepo;
        this.jdbc = jdbc;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        UserIdentifierEntity ident = identifierRepo.findByIdentifier(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return loadUserById(ident.userId());
    }

    @Cacheable(value = "userDetails", key = "#userId")
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<SimpleGrantedAuthority> authorities = jdbc
                .queryForList("SELECT authority FROM authorities WHERE user_id = ?", String.class, user.id())
                .stream().map(SimpleGrantedAuthority::new).toList();

        return new User(
                String.valueOf(user.id()),
                user.password() != null ? user.password() : "",
                user.enabled(),
                true, true, true,
                authorities
        );
    }
}
