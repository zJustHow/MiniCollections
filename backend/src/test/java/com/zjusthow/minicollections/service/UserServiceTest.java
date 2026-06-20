package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.ObjectSubmissionEntity;
import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.entity.UserIdentifierEntity;
import com.zjusthow.minicollections.entity.UserObjectEntity;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.UserNotFoundException;
import com.zjusthow.minicollections.exception.InvalidCodeException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.WechatService;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.ObjectSubmissionRepository;
import com.zjusthow.minicollections.repository.UserIdentifierRepository;
import com.zjusthow.minicollections.repository.UserObjectRepository;
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

import java.util.Collections;
import java.util.List;
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
    @Mock UserObjectRepository userObjectRepository;
    @Mock ObjectSubmissionRepository submissionRepository;
    @Mock UserRepository userRepository;
    @Mock UserIdentifierRepository identifierRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JdbcTemplate jdbc;
    @Mock VerificationService verificationService;
    @Mock ImageStorageService imageStorageService;

    @InjectMocks UserService userService;

    @Test
    void getUserById_returnsExistingUser() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        assertEquals(user, userService.getUserById(5L));
    }

    @Test
    void getUserById_throwsWhenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void isAdmin_returnsTrueWhenAuthorityExists() {
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(true);

        assertTrue(userService.isAdmin(5L));
    }

    @Test
    void hasAnyAdmin_returnsFalseWhenNoAdminsExist() {
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE authority = 'ROLE_ADMIN'"),
                eq(Boolean.class)))
                .thenReturn(false);

        assertFalse(userService.hasAnyAdmin());
    }

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
    void signUp_withPhoneCreatesUserAndDefaultGroup() {
        when(identifierRepository.existsByTypeAndIdentifier("phone", "+8613800138000"))
                .thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hash");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            UserEntity saved = invocation.getArgument(0);
            return new UserEntity(11L, saved.displayName(), saved.password(), saved.enabled(),
                    saved.preferredLocale(), saved.avatarUrl());
        });

        Long userId = userService.signUp(null, " +8613800138000 ", "secret", "Bob", "zh-CN");

        assertEquals(11L, userId);
        ArgumentCaptor<UserIdentifierEntity> identCaptor = ArgumentCaptor.forClass(UserIdentifierEntity.class);
        verify(identifierRepository).save(identCaptor.capture());
        assertEquals("phone", identCaptor.getValue().type());
        assertEquals("+8613800138000", identCaptor.getValue().identifier());
        verify(groupRepository).save(any());
        verify(jdbc).update("INSERT INTO authorities (user_id, authority) VALUES (?, ?)", 11L, "ROLE_USER");
    }

    @Test
    void signUp_rejectsDuplicatePhone() {
        when(identifierRepository.existsByTypeAndIdentifier("phone", "+8613800138000"))
                .thenReturn(true);

        assertThrows(IdentifierExistsException.class,
                () -> userService.signUp(null, "+8613800138000", "pw", "Bob", "en-US"));
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
    void revokeAdminRole_noopsWhenUserIsNotAdmin() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(
                new UserEntity(3L, "Bob", "hash", true, "en-US", null)));
        when(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                Boolean.class, 3L)).thenReturn(false);

        userService.revokeAdminRole(3L);

        verify(jdbc, never()).update(
                eq("DELETE FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(3L));
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
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of(
                new UserIdentifierEntity(2L, 5L, "wechat_openid", "openid-1")));
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
    void updatePassword_updatesWhenCurrentPasswordMatches() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-pass", "hash")).thenReturn(true);
        when(passwordEncoder.encode("new-pass")).thenReturn("encoded");
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of());
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.updatePassword(5L, "old-pass", "new-pass");

        verify(userRepository).updatePasswordById(5L, "encoded");
        assertEquals("Alice", profile.displayName());
    }

    @Test
    void findOrCreateWechatUser_returnsExistingUnionidUser() {
        when(identifierRepository.findByTypeAndIdentifier("wechat_unionid", "union-1"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 7L, "wechat_unionid", "union-1")));

        assertEquals(7L, userService.findOrCreateWechatUser("openid", "union-1", "Nick", null));
        verify(userRepository, never()).save(any());
    }

    @Test
    void findOrCreateWechatUser_returnsExistingOpenidUser() {
        when(identifierRepository.findByTypeAndIdentifier("wechat_unionid", "union-1"))
                .thenReturn(Optional.empty());
        when(identifierRepository.findByTypeAndIdentifier("wechat_openid", "openid-1"))
                .thenReturn(Optional.of(new UserIdentifierEntity(1L, 8L, "wechat_openid", "openid-1")));

        assertEquals(8L, userService.findOrCreateWechatUser("openid-1", "union-1", "Nick", null));
        verify(userRepository, never()).save(any());
    }

    @Test
    void findOrCreateWechatUser_createsNewUserWhenMissing() {
        when(identifierRepository.findByTypeAndIdentifier("wechat_unionid", "union-1"))
                .thenReturn(Optional.empty());
        when(identifierRepository.findByTypeAndIdentifier("wechat_openid", "openid-1"))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity entity = invocation.getArgument(0);
            return new UserEntity(9L, entity.displayName(), null, entity.enabled(), entity.preferredLocale(), entity.avatarUrl());
        });

        Long userId = userService.findOrCreateWechatUser("openid-1", "union-1", "Nick", "avatar.png");

        assertEquals(9L, userId);
        verify(identifierRepository, times(2)).save(any(UserIdentifierEntity.class));
        verify(jdbc).update(
                eq("INSERT INTO authorities (user_id, authority) VALUES (?, ?)"),
                eq(9L),
                eq("ROLE_USER"));
        verify(groupRepository).save(any());
    }

    @Test
    void getProfile_includesEmailAndAdminFlag() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of(
                new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
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
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of());
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
    void grantAdminRole_throwsWhenUserMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.grantAdminRole(99L));
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
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of(
                new UserIdentifierEntity(1L, 5L, "email", "alice@example.com")));
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
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of(
                new UserIdentifierEntity(1L, 5L, "email", "new@example.com")));
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
    void updateIdentifier_insertsWhenNoExistingIdentifier() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(identifierRepository.existsByTypeAndIdentifier("phone", "13800138000"))
                .thenReturn(false);
        when(identifierRepository.findByUserIdAndType(5L, "phone"))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(new UserIdentifierEntity(2L, 5L, "phone", "13800138000")));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of(
                new UserIdentifierEntity(2L, 5L, "phone", "13800138000")));
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);

        UserProfileDto profile = userService.updateIdentifier(5L, "phone", "13800138000");

        ArgumentCaptor<UserIdentifierEntity> captor = ArgumentCaptor.forClass(UserIdentifierEntity.class);
        verify(identifierRepository).save(captor.capture());
        assertEquals(null, captor.getValue().id());
        assertEquals("13800138000", captor.getValue().identifier());
        assertEquals("13800138000", profile.phone());
    }

    @Test
    void updatePreferredLocale_persistsAndReturnsProfile() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of());
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
        when(identifierRepository.findByUserId(5L)).thenReturn(List.of());
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
    void resetPassword_withPhoneVerifiesCodeAndUpdatesPassword() {
        when(identifierRepository.findByTypeAndIdentifier("phone", "+8613800138000"))
                .thenReturn(Optional.of(new UserIdentifierEntity(2L, 6L, "phone", "+8613800138000")));
        when(passwordEncoder.encode("newpass")).thenReturn("encoded");

        Long userId = userService.resetPassword(null, "+8613800138000", "123456", "newpass");

        assertEquals(6L, userId);
        verify(verificationService).verifyResetCode("+8613800138000", "123456");
        verify(userRepository).updatePasswordById(6L, "encoded");
    }

    @Test
    void resetPassword_requiresEmailOrPhone() {
        assertThrows(ValidationException.class,
                () -> userService.resetPassword(null, null, "123456", "newpass"));
    }

    @Test
    void resetPassword_rejectsInvalidCode() {
        org.mockito.Mockito.doThrow(new InvalidCodeException("error.code_invalid"))
                .when(verificationService)
                .verifyResetCode("alice@example.com", "000000");

        assertThrows(InvalidCodeException.class,
                () -> userService.resetPassword("alice@example.com", null, "000000", "newpass"));
        verify(userRepository, never()).updatePasswordById(any(), anyString());
    }

    @Test
    void deleteAccount_removesUserAfterPasswordVerification() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", "avatar.png");
        GroupEntity group = new GroupEntity(1L, 5L, "Default", "group.png", 0);
        UserObjectEntity object = new UserObjectEntity(
                10L, 5L, 1L, null, "Car", "obj.png", null, null, null, 0);
        ObjectSubmissionEntity submission = new ObjectSubmissionEntity(
                20L, 5L, "MISSING_MODEL", null, null, "sub.png", null, null, null, null, null, null, null, null,
                "PENDING", null, null, null, null, null, null);

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(groupRepository.findByUserId(5L)).thenReturn(Optional.of(List.of(group)));
        when(userObjectRepository.findByUserId(5L)).thenReturn(Optional.of(List.of(object)));
        when(submissionRepository.findBySubmittedByUserId(5L)).thenReturn(List.of(submission));

        userService.deleteAccount(5L, "secret");

        verify(imageStorageService).deleteUserImageIfOwned(5L, "avatar.png");
        verify(imageStorageService).deleteUserImageIfOwned(5L, "group.png");
        verify(imageStorageService).deleteUserImageIfOwned(5L, "obj.png");
        verify(imageStorageService).deleteUserImageIfOwned(5L, "sub.png");
        verify(jdbc).update(
                eq("UPDATE object_submissions SET reviewed_by_user_id = NULL WHERE reviewed_by_user_id = ?"),
                eq(5L));
        verify(userRepository).deleteById(5L);
    }

    @Test
    void deleteAccount_rejectsIncorrectPassword() {
        UserEntity user = new UserEntity(5L, "Alice", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.deleteAccount(5L, "wrong"));
        verify(userRepository, never()).deleteById(5L);
    }

    @Test
    void deleteAccount_rejectsLastAdmin() {
        UserEntity user = new UserEntity(5L, "Admin", "hash", true, "en-US", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(true);
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) FROM authorities WHERE authority = 'ROLE_ADMIN'"),
                eq(Integer.class)))
                .thenReturn(1);

        assertThrows(ValidationException.class, () -> userService.deleteAccount(5L, "secret"));
        verify(userRepository, never()).deleteById(5L);
    }

    @Test
    void deleteAccount_allowsPasswordlessUser() {
        UserEntity user = new UserEntity(5L, "WeChat User", null, true, "zh-CN", null);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(jdbc.queryForObject(
                eq("SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'"),
                eq(Boolean.class),
                eq(5L)))
                .thenReturn(false);
        when(groupRepository.findByUserId(5L)).thenReturn(Optional.of(Collections.emptyList()));
        when(userObjectRepository.findByUserId(5L)).thenReturn(Optional.of(Collections.emptyList()));
        when(submissionRepository.findBySubmittedByUserId(5L)).thenReturn(Collections.emptyList());

        userService.deleteAccount(5L, null);

        verify(userRepository).deleteById(5L);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }
}
