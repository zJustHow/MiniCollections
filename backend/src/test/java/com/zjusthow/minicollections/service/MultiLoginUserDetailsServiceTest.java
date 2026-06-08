package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.entity.UserIdentifierEntity;
import com.zjusthow.minicollections.repository.UserIdentifierRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MultiLoginUserDetailsServiceTest {

    @Mock UserIdentifierRepository identifierRepo;
    @Mock UserRepository userRepo;
    @Mock JdbcTemplate jdbc;

    @InjectMocks MultiLoginUserDetailsService userDetailsService;

    @Test
    void loadUserByUsername_resolvesIdentifierToUserId() {
        when(identifierRepo.findByIdentifier("alice@example.com"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
        when(userRepo.findById(5L)).thenReturn(Optional.of(
                new UserEntity(5L, "Alice", "hash", true, "en-US", null)));
        when(jdbc.queryForList("SELECT authority FROM authorities WHERE user_id = ?", String.class, 5L))
                .thenReturn(List.of("ROLE_USER"));

        UserDetails details = userDetailsService.loadUserByUsername("alice@example.com");

        assertEquals("5", details.getUsername());
        assertTrue(details.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    void loadUserByUsername_missingIdentifierThrows() {
        when(identifierRepo.findByIdentifier("missing")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("missing"));
    }

    @Test
    void loadUserById_usesEmptyPasswordWhenNull() {
        when(userRepo.findById(8L)).thenReturn(Optional.of(
                new UserEntity(8L, "WeChat", null, true, "zh-CN", null)));
        when(jdbc.queryForList("SELECT authority FROM authorities WHERE user_id = ?", String.class, 8L))
                .thenReturn(List.of("ROLE_USER"));

        UserDetails details = userDetailsService.loadUserById(8L);

        assertEquals("8", details.getUsername());
        assertEquals("", details.getPassword());
    }
}
