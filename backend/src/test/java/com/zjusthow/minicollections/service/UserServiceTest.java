package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.entity.UserIdentifierEntity;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.UserNotFoundException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.WechatService;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.UserIdentifierRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock GroupRepository groupRepository;
    @Mock UserRepository userRepository;
    @Mock UserIdentifierRepository identifierRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JdbcTemplate jdbc;
    @Mock VerificationService verificationService;
    @Mock ImageStorageService imageStorageService;

    @InjectMocks UserService userService;

    @Test
    void signUp_requiresEmailOrPhone() {
        assertThrows(ValidationException.class,
                () -> userService.signUp(null, "  ", "pw", "Alice", "en-US"));
    }

    @Test
    void signUp_rejectsDuplicateEmail() {
        when(identifierRepository.existsByTypeAndIdentifier("email", "alice@example.com"))
                .thenReturn(true);

        assertThrows(IdentifierExistsException.class,
                () -> userService.signUp("Alice@Example.com", null, "pw", "Alice", "en-US"));
    }

    @Test
    void signUp_normalizesEmailAndCreatesUser() {
        when(identifierRepository.existsByTypeAndIdentifier("email", "alice@example.com"))
                .thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hash");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            UserEntity saved = invocation.getArgument(0);
            return new UserEntity(9L, saved.displayName(), saved.password(), saved.enabled(),
                    saved.preferredLocale(), saved.avatarUrl());
        });

        Long userId = userService.signUp("Alice@Example.com", null, "secret", "Alice", "en-US");

        assertEquals(9L, userId);
        ArgumentCaptor<UserIdentifierEntity> identCaptor = ArgumentCaptor.forClass(UserIdentifierEntity.class);
        verify(identifierRepository).save(identCaptor.capture());
        assertEquals("email", identCaptor.getValue().type());
        assertEquals("alice@example.com", identCaptor.getValue().identifier());
        verify(jdbc).update("INSERT INTO authorities (user_id, authority) VALUES (?, ?)", 9L, "ROLE_USER");
    }

    @Test
    void tryBootstrapAdmin_isIdempotentWhenAdminExists() {
        when(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE authority = 'ROLE_ADMIN'",
                Boolean.class)).thenReturn(true);

        assertFalse(userService.tryBootstrapAdmin("admin@example.com", "pw", "Admin", "en-US"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void tryBootstrapAdmin_signsUpAndGrantsAdminWhenMissing() {
        when(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE authority = 'ROLE_ADMIN'",
                Boolean.class)).thenReturn(false);
        when(identifierRepository.findByTypeAndIdentifier("email", "admin@example.com"))
                .thenReturn(Optional.empty());
        when(identifierRepository.existsByTypeAndIdentifier("email", "admin@example.com"))
                .thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hash");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            UserEntity saved = invocation.getArgument(0);
            return new UserEntity(9L, saved.displayName(), saved.password(), saved.enabled(),
                    saved.preferredLocale(), saved.avatarUrl());
        });
        when(userRepository.findById(9L)).thenReturn(Optional.of(
                new UserEntity(9L, "Admin", "hash", true, "en-US", null)));

        assertTrue(userService.tryBootstrapAdmin("admin@example.com", "secret", "Admin", "en-US"));

        verify(jdbc).update(
                eq("INSERT INTO authorities (user_id, authority) VALUES (?, ?) ON CONFLICT DO NOTHING"),
                eq(9L),
                eq("ROLE_ADMIN"));
    }

    @Test
    void revokeAdminRole_blocksLastAdminRemoval() {
        UserEntity admin = new UserEntity(1L, "Admin", "hash", true, "en-US", null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                Boolean.class, 1L)).thenReturn(true);
        when(jdbc.queryForObject(
                "SELECT COUNT(*) FROM authorities WHERE authority = 'ROLE_ADMIN'",
                Integer.class)).thenReturn(1);

        assertThrows(IllegalStateException.class, () -> userService.revokeAdminRole(1L));
    }

    @Test
    void revokeAdminRole_removesAuthorityWhenOtherAdminsExist() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(
                new UserEntity(2L, "Admin2", "hash", true, "en-US", null)));
        when(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                Boolean.class, 2L)).thenReturn(true);
        when(jdbc.queryForObject(
                "SELECT COUNT(*) FROM authorities WHERE authority = 'ROLE_ADMIN'",
                Integer.class)).thenReturn(2);

        userService.revokeAdminRole(2L);

        verify(jdbc).update(
                "DELETE FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                2L);
    }

    @Test
    void bindWechat_upsertsIdentifiersAndReturnsProfile() {
        WechatService.WechatUserInfo info =
                new WechatService.WechatUserInfo("openid-1", "union-1", "Nick", null);
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(identifierRepository.findByTypeAndIdentifier("wechat_unionid", "union-1"))
                .thenReturn(Optional.empty());
        when(identifierRepository.findByTypeAndIdentifier("wechat_openid", "openid-1"))
                .thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "wechat_openid"))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(new UserIdentifierEntity(2L, 5L, "wechat_openid", "openid-1")));
        when(identifierRepository.findByUserIdAndType(5L, "wechat_unionid"))
                .thenReturn(Optional.empty());
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserIdAndType(5L, "email")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "phone")).thenReturn(Optional.empty());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.bindWechat(5L, info);

        verify(identifierRepository, times(2)).save(any());
        assertTrue(profile.wechatBound());
    }

    @Test
    void bindWechat_rejectsOpenidBoundToAnotherUser() {
        WechatService.WechatUserInfo info =
                new WechatService.WechatUserInfo("openid-1", null, "Nick", null);
        when(identifierRepository.findByTypeAndIdentifier("wechat_openid", "openid-1"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 99L, "wechat_openid", "openid-1")));

        assertThrows(IdentifierExistsException.class, () -> userService.bindWechat(5L, info));
    }

    @Test
    void sendPasswordResetCode_deliversWhenUserHasPassword() {
        when(identifierRepository.findByTypeAndIdentifier("email", "alice@example.com"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
        when(userRepository.findById(5L)).thenReturn(Optional.of(
                new UserEntity(5L, "Alice", "hash", true, "en-US", null)));

        userService.sendPasswordResetCode("Alice@Example.com", "EMAIL");

        verify(verificationService).sendResetCode("alice@example.com", "EMAIL", true);
    }

    @Test
    void sendPasswordResetCode_skipsDeliveryWhenUserHasNoPassword() {
        when(identifierRepository.findByTypeAndIdentifier("email", "alice@example.com"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
        when(userRepository.findById(5L)).thenReturn(Optional.of(
                new UserEntity(5L, "Alice", null, true, "en-US", null)));

        userService.sendPasswordResetCode("alice@example.com", "EMAIL");

        verify(verificationService).sendResetCode("alice@example.com", "EMAIL", false);
    }

    @Test
    void updatePassword_rejectsWrongCurrentPassword() {
        UserEntity user = new UserEntity(3L, "Bob", "hash", true, "en-US", null);
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThrows(BadCredentialsException.class,
                () -> userService.updatePassword(3L, "wrong", "new"));
    }

    @Test
    void findOrCreateWechatUser_returnsExistingUnionidUser() {
        when(identifierRepository.findByTypeAndIdentifier("wechat_unionid", "union-1"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 7L, "wechat_unionid", "union-1")));

        assertEquals(7L, userService.findOrCreateWechatUser("openid", "union-1", "Nick", null));
        verify(userRepository, never()).save(any());
    }

    @Test
    void getProfile_includesEmailAndAdminFlag() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserIdAndType(5L, "email"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
        when(identifierRepository.findByUserIdAndType(5L, "phone")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "wechat_openid")).thenReturn(Optional.empty());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.getProfile(5L);

        assertEquals("Alice", profile.displayName());
        assertEquals("alice@example.com", profile.email());
        assertFalse(profile.admin());
        assertFalse(profile.wechatBound());
    }

    @Test
    void updateDisplayName_persistsAndReturnsProfile() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserIdAndType(5L, "email")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "phone")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "wechat_openid")).thenReturn(Optional.empty());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.updateDisplayName(5L, "  Alice Updated  ");

        verify(userRepository).updateDisplayNameById(5L, "Alice Updated");
        assertEquals("Alice", profile.displayName());
    }

    @Test
    void grantAdminRole_insertsAuthority() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(
                new UserEntity(3L, "Bob", "hash", true, "en-US", null)));

        userService.grantAdminRole(3L);

        verify(jdbc).update(
                eq("INSERT INTO authorities (user_id, authority) VALUES (?, ?) ON CONFLICT DO NOTHING"),
                eq(3L),
                eq("ROLE_ADMIN"));
    }

    @Test
    void getProfileByEmail_throwsWhenMissing() {
        when(identifierRepository.findByTypeAndIdentifier("email", "missing@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> userService.getProfileByEmail("missing@example.com"));
    }

    @Test
    void getProfileByEmail_normalizesEmailAndReturnsProfile() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(identifierRepository.findByTypeAndIdentifier("email", "alice@example.com"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserIdAndType(5L, "email"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
        when(identifierRepository.findByUserIdAndType(5L, "phone")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "wechat_openid")).thenReturn(Optional.empty());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.getProfileByEmail("Alice@Example.com");

        assertEquals("Alice", profile.displayName());
        assertEquals("alice@example.com", profile.email());
    }

    @Test
    void updateIdentifier_rejectsDuplicateIdentifier() {
        when(identifierRepository.existsByTypeAndIdentifier("email", "taken@example.com"))
                .thenReturn(true);

        assertThrows(IdentifierExistsException.class,
                () -> userService.updateIdentifier(5L, "email", "Taken@Example.com"));
    }

    @Test
    void updateIdentifier_upsertsAndReturnsProfile() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(identifierRepository.existsByTypeAndIdentifier("email", "new@example.com"))
                .thenReturn(false);
        when(identifierRepository.findByUserIdAndType(5L, "email"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "old@example.com")))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "new@example.com")));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserIdAndType(5L, "phone")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "wechat_openid")).thenReturn(Optional.empty());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.updateIdentifier(5L, "email", "  New@Example.com  ");

        verify(identifierRepository).save(new UserIdentifierEntity(1L, 5L, "email", "new@example.com"));
        assertEquals("new@example.com", profile.email());
    }

    @Test
    void updatePreferredLocale_persistsAndReturnsProfile() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserIdAndType(5L, "email")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "phone")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "wechat_openid")).thenReturn(Optional.empty());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.updatePreferredLocale(5L, "  zh-CN  ");

        verify(userRepository).updatePreferredLocaleById(5L, "zh-CN");
        assertEquals("Alice", profile.displayName());
    }

    @Test
    void updateAvatarUrl_replacesStoredImageAndReturnsProfile() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", "old.png");
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserIdAndType(5L, "email")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "phone")).thenReturn(Optional.empty());
        when(identifierRepository.findByUserIdAndType(5L, "wechat_openid")).thenReturn(Optional.empty());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.updateAvatarUrl(5L, "new.png");

        verify(imageStorageService).deleteReplacedUserImage(5L, "old.png", "new.png");
        verify(userRepository).updateAvatarUrlById(5L, "new.png");
        assertEquals("Alice", profile.displayName());
    }

    @Test
    void resetPassword_verifiesCodeAndUpdatesPassword() {
        when(identifierRepository.findByTypeAndIdentifier("email", "alice@example.com"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
        when(passwordEncoder.encode("newpass")).thenReturn("encoded");

        Long userId = userService.resetPassword("Alice@Example.com", null, "123456", "newpass");

        assertEquals(5L, userId);
        verify(verificationService).verifyResetCode("alice@example.com", "123456");
        verify(userRepository).updatePasswordById(5L, "encoded");
    }

    @Test
    void resetPassword_requiresEmailOrPhone() {
        assertThrows(ValidationException.class,
                () -> userService.resetPassword(null, null, "123456", "newpass"));
    }
}
