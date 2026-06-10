package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.entity.UserIdentifierEntity;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.UserNotFoundException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.ObjectSubmissionRepository;
import com.zjusthow.minicollections.repository.UserIdentifierRepository;
import com.zjusthow.minicollections.repository.UserObjectRepository;
import com.zjusthow.minicollections.repository.UserRepository;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.UserProfileDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class UserService {

    private final GroupRepository groupRepository;
    private final UserObjectRepository userObjectRepository;
    private final ObjectSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final UserIdentifierRepository identifierRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbc;
    private final ImageStorageService imageStorageService;
    private final VerificationService verificationService;

    public UserService(
            GroupRepository groupRepository,
            UserObjectRepository userObjectRepository,
            ObjectSubmissionRepository submissionRepository,
            UserRepository userRepository,
            UserIdentifierRepository identifierRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbc,
            VerificationService verificationService,
            @Autowired(required = false) ImageStorageService imageStorageService) {
        this.groupRepository = groupRepository;
        this.userObjectRepository = userObjectRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.identifierRepository = identifierRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbc = jdbc;
        this.verificationService = verificationService;
        this.imageStorageService = imageStorageService;
    }

    @Transactional
    public Long signUp(String email, String phone, String password, String name, String preferredLocale) {
        final String normalizedEmail = (email != null && !email.isBlank()) ? email.toLowerCase().strip() : null;
        final String normalizedPhone = (phone != null && !phone.isBlank()) ? phone.strip() : null;

        if (normalizedEmail == null && normalizedPhone == null) {
            throw new ValidationException("error.email_or_phone_required");
        }

        if (normalizedEmail != null) {
            if (identifierRepository.existsByTypeAndIdentifier("email", normalizedEmail)) {
                throw new IdentifierExistsException("error.email_registered");
            }
        }

        if (normalizedPhone != null) {
            if (identifierRepository.existsByTypeAndIdentifier("phone", normalizedPhone)) {
                throw new IdentifierExistsException("error.phone_registered");
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
        groupRepository.save(new GroupEntity(
                null, user.id(), DisplayLocaleResolver.defaultGroupName(locale), null, 0));

        return user.id();
    }

    @Cacheable(value = "users", key = "#id")
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(UserNotFoundException::new);
    }

    public UserProfileDto getProfile(Long userId) {
        UserEntity u = getUserById(userId);
        String email = null;
        String phone = null;
        boolean wechatBound = false;
        for (UserIdentifierEntity identifier : identifierRepository.findByUserId(userId)) {
            switch (identifier.type()) {
                case "email" -> email = identifier.identifier();
                case "phone" -> phone = identifier.identifier();
                case "wechat_openid" -> wechatBound = true;
                default -> { }
            }
        }
        boolean isAdmin = Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                Boolean.class, userId));
        boolean passwordSet = u.password() != null && !u.password().isBlank();
        return new UserProfileDto(
                u.id(), email, phone, u.displayName(), u.preferredLocale(), u.avatarUrl(),
                isAdmin, wechatBound, passwordSet);
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
        UserEntity user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        if (imageStorageService != null) {
            imageStorageService.deleteReplacedUserImage(userId, user.avatarUrl(), avatarUrl);
        }
        userRepository.updateAvatarUrlById(userId, avatarUrl);
        return getProfile(userId);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId", beforeInvocation = true)
    public UserProfileDto updateDisplayName(Long userId, String displayName) {
        userRepository.updateDisplayNameById(userId, displayName.strip());
        return getProfile(userId);
    }

    public void sendPasswordResetCode(String target, String type) {
        String normalizedTarget = "EMAIL".equals(type) ? target.toLowerCase().strip() : target.strip();
        String identType = "EMAIL".equals(type) ? "email" : "phone";

        boolean deliver = identifierRepository.findByTypeAndIdentifier(identType, normalizedTarget)
                .flatMap(ident -> userRepository.findById(ident.userId()))
                .filter(user -> user.password() != null && !user.password().isBlank())
                .isPresent();

        verificationService.sendResetCode(normalizedTarget, type, deliver);
    }

    @Transactional
    @CacheEvict(value = {"users", "userDetails"}, key = "#result")
    public Long resetPassword(String email, String phone, String code, String newPassword) {
        final String normalizedEmail = (email != null && !email.isBlank()) ? email.toLowerCase().strip() : null;
        final String normalizedPhone = (phone != null && !phone.isBlank()) ? phone.strip() : null;

        if (normalizedEmail == null && normalizedPhone == null) {
            throw new ValidationException("error.email_or_phone_required");
        }

        String target = normalizedEmail != null ? normalizedEmail : normalizedPhone;
        verificationService.verifyResetCode(target, code);

        String identType = normalizedEmail != null ? "email" : "phone";
        UserIdentifierEntity ident = identifierRepository.findByTypeAndIdentifier(identType, target)
                .orElseThrow(UserNotFoundException::new);

        userRepository.updatePasswordById(ident.userId(), passwordEncoder.encode(newPassword));
        return ident.userId();
    }

    @Transactional
    @CacheEvict(value = {"users", "userDetails"}, key = "#userId", beforeInvocation = true)
    public UserProfileDto updatePassword(Long userId, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        if (!passwordEncoder.matches(currentPassword, user.password())) {
            throw new BadCredentialsException("error.password_incorrect");
        }
        userRepository.updatePasswordById(userId, passwordEncoder.encode(newPassword));
        return getProfile(userId);
    }

    @Transactional
    public Long findOrCreateWechatUser(String openid, String unionid, String nickname, String avatarUrl) {
        // 优先用 unionid 查找（跨应用唯一）
        if (unionid != null) {
            var byUnionid = identifierRepository.findByTypeAndIdentifier("wechat_unionid", unionid);
            if (byUnionid.isPresent()) return byUnionid.get().userId();
        }
        // 次选 openid
        var byOpenid = identifierRepository.findByTypeAndIdentifier("wechat_openid", openid);
        if (byOpenid.isPresent()) return byOpenid.get().userId();

        // 新建用户
        String name = (nickname != null && !nickname.isBlank()) ? nickname : "微信用户";
        UserEntity user = userRepository.save(new UserEntity(null, name, null, true, "zh-CN", avatarUrl));
        identifierRepository.save(new UserIdentifierEntity(null, user.id(), "wechat_openid", openid));
        if (unionid != null) {
            identifierRepository.save(new UserIdentifierEntity(null, user.id(), "wechat_unionid", unionid));
        }
        jdbc.update("INSERT INTO authorities (user_id, authority) VALUES (?, ?)", user.id(), "ROLE_USER");
        groupRepository.save(new GroupEntity(
                null, user.id(), DisplayLocaleResolver.defaultGroupName("zh-CN"), null, 0));
        return user.id();
    }

    @Transactional
    public UserProfileDto bindWechat(Long userId, WechatService.WechatUserInfo info) {
        // Reject if this WeChat account is already bound to a different user
        if (info.unionid() != null) {
            identifierRepository.findByTypeAndIdentifier("wechat_unionid", info.unionid())
                    .ifPresent(existing -> {
                        if (!existing.userId().equals(userId))
                            throw new IdentifierExistsException("error.wechat_bound_to_other");
                    });
        }
        identifierRepository.findByTypeAndIdentifier("wechat_openid", info.openid())
                .ifPresent(existing -> {
                    if (!existing.userId().equals(userId))
                        throw new IdentifierExistsException("error.wechat_bound_to_other");
                });

        // Upsert wechat_openid
        identifierRepository.findByUserIdAndType(userId, "wechat_openid")
                .ifPresentOrElse(
                        existing -> identifierRepository.save(
                                new UserIdentifierEntity(existing.id(), userId, "wechat_openid", info.openid())),
                        () -> identifierRepository.save(
                                new UserIdentifierEntity(null, userId, "wechat_openid", info.openid()))
                );
        // Upsert wechat_unionid if present
        if (info.unionid() != null) {
            identifierRepository.findByUserIdAndType(userId, "wechat_unionid")
                    .ifPresentOrElse(
                            existing -> identifierRepository.save(
                                    new UserIdentifierEntity(existing.id(), userId, "wechat_unionid", info.unionid())),
                            () -> identifierRepository.save(
                                    new UserIdentifierEntity(null, userId, "wechat_unionid", info.unionid()))
                    );
        }
        return getProfile(userId);
    }

    public boolean hasAnyAdmin() {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE authority = 'ROLE_ADMIN'",
                Boolean.class));
    }

    public boolean isAdmin(Long userId) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT COUNT(*) > 0 FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                Boolean.class, userId));
    }

    public UserProfileDto getProfileByEmail(String email) {
        final String normalizedEmail = email.toLowerCase().strip();
        Long userId = identifierRepository.findByTypeAndIdentifier("email", normalizedEmail)
                .map(UserIdentifierEntity::userId)
                .orElseThrow(UserNotFoundException::new);
        return getProfile(userId);
    }

    /**
     * Creates or promotes the bootstrap admin when none exists. Idempotent once any admin is present.
     *
     * @return true if an admin account was ensured
     */
    @Transactional
    public boolean tryBootstrapAdmin(String email, String password, String name, String preferredLocale) {
        if (hasAnyAdmin()) {
            return false;
        }
        if (email == null || email.isBlank()) {
            return false;
        }

        final String normalizedEmail = email.toLowerCase().strip();
        Long userId = identifierRepository.findByTypeAndIdentifier("email", normalizedEmail)
                .map(UserIdentifierEntity::userId)
                .orElse(null);

        if (userId == null) {
            if (password == null || password.isBlank()) {
                return false;
            }
            String displayName = (name != null && !name.isBlank()) ? name.strip() : "Admin";
            userId = signUp(normalizedEmail, null, password, displayName, preferredLocale);
        }

        grantAdminRole(userId);
        return true;
    }

    @Transactional
    @CacheEvict(value = "userDetails", key = "#userId")
    public void grantAdminRole(Long userId) {
        userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        jdbc.update(
                "INSERT INTO authorities (user_id, authority) VALUES (?, ?) ON CONFLICT DO NOTHING",
                userId,
                "ROLE_ADMIN");
    }

    @Transactional
    @CacheEvict(value = "userDetails", key = "#targetUserId")
    public void revokeAdminRole(Long targetUserId) {
        userRepository.findById(targetUserId).orElseThrow(UserNotFoundException::new);
        if (!isAdmin(targetUserId)) {
            return;
        }
        int adminCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM authorities WHERE authority = 'ROLE_ADMIN'",
                Integer.class);
        if (adminCount <= 1) {
            throw new IllegalStateException("Cannot revoke the last admin");
        }
        jdbc.update(
                "DELETE FROM authorities WHERE user_id = ? AND authority = 'ROLE_ADMIN'",
                targetUserId);
    }

    @Transactional
    @CacheEvict(value = {"users", "userDetails"}, key = "#userId", beforeInvocation = true)
    public void deleteAccount(Long userId, String password) {
        UserEntity user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

        if (isAdmin(userId)) {
            int adminCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM authorities WHERE authority = 'ROLE_ADMIN'",
                    Integer.class);
            if (adminCount <= 1) {
                throw new ValidationException("error.cannot_delete_last_admin");
            }
        }

        boolean passwordSet = user.password() != null && !user.password().isBlank();
        if (passwordSet) {
            if (password == null || password.isBlank()) {
                throw new ValidationException("error.password_required");
            }
            if (!passwordEncoder.matches(password, user.password())) {
                throw new BadCredentialsException("error.password_incorrect");
            }
        }

        deleteStoredUserImages(userId, user.avatarUrl());
        groupRepository.findByUserId(userId)
                .orElse(Collections.emptyList())
                .forEach(group -> deleteStoredUserImages(userId, group.imageUrl()));
        userObjectRepository.findByUserId(userId)
                .orElse(Collections.emptyList())
                .forEach(object -> deleteStoredUserImages(userId, object.imageUrl()));
        submissionRepository.findBySubmittedByUserId(userId)
                .forEach(submission -> deleteStoredUserImages(userId, submission.imageUrl()));

        jdbc.update(
                "UPDATE object_submissions SET reviewed_by_user_id = NULL WHERE reviewed_by_user_id = ?",
                userId);
        userRepository.deleteById(userId);
    }

    private void deleteStoredUserImages(long userId, String imageUrl) {
        if (imageStorageService != null) {
            imageStorageService.deleteUserImageIfOwned(userId, imageUrl);
        }
    }

    @Transactional
    public UserProfileDto updateIdentifier(Long userId, String type, String identifier) {
        final String normalized = identifier.strip().toLowerCase();
        if (identifierRepository.existsByTypeAndIdentifier(type, normalized)) {
            throw new IdentifierExistsException("error.identifier_in_use", type);
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
