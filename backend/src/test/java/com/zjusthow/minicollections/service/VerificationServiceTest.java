package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.exception.InvalidCodeException;
import com.zjusthow.minicollections.exception.TooManyRequestsException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.service.sms.SmsSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerificationServiceTest {

    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> valueOps;
    @Mock EmailService emailService;
    @Mock SmsSender smsSender;

    @InjectMocks VerificationService verificationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(verificationService, "otpTtlSeconds", 300);
        ReflectionTestUtils.setField(verificationService, "resendCooldownSeconds", 60);
    }

    @Test
    void sendCode_blocksResendDuringCooldown() {
        when(redis.getExpire("otp:alice@example.com", TimeUnit.SECONDS)).thenReturn(280L);

        assertThrows(TooManyRequestsException.class,
                () -> verificationService.sendCode("alice@example.com", "EMAIL"));
        verify(valueOps, never()).set(anyString(), anyString(), anyLong(), eq(TimeUnit.SECONDS));
    }

    @Test
    void sendCode_rejectsUnknownType() {
        when(redis.getExpire("otp:target", TimeUnit.SECONDS)).thenReturn(-1L);
        when(redis.opsForValue()).thenReturn(valueOps);

        assertThrows(ValidationException.class,
                () -> verificationService.sendCode("target", "FAX"));
    }

    @Test
    void sendCode_emailsCodeWhenAllowed() {
        when(redis.getExpire("otp:alice@example.com", TimeUnit.SECONDS)).thenReturn(-1L);
        when(redis.opsForValue()).thenReturn(valueOps);

        verificationService.sendCode("alice@example.com", "EMAIL");

        verify(valueOps).set(eq("otp:alice@example.com"), anyString(), eq(300L), eq(TimeUnit.SECONDS));
        verify(emailService).sendCode(eq("alice@example.com"), org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void verify_rejectsMissingCode() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("otp:alice@example.com")).thenReturn(null);

        assertThrows(InvalidCodeException.class,
                () -> verificationService.verify("alice@example.com", "123456"));
    }

    @Test
    void verify_acceptsMatchingCodeAndDeletesKey() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("otp:alice@example.com")).thenReturn("123456");

        verificationService.verify("alice@example.com", "123456");

        verify(redis).delete("otp:alice@example.com");
    }

    @Test
    void verify_matchesEmailCaseInsensitively() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("otp:alice@example.com")).thenReturn("123456");

        verificationService.verify("Alice@Example.com", "123456");

        verify(redis).delete("otp:alice@example.com");
    }

    @Test
    void sendResetCode_skipsDeliveryWhenUserHasNoPassword() {
        when(redis.hasKey("otp:reset:cooldown:alice@example.com")).thenReturn(false);
        when(redis.opsForValue()).thenReturn(valueOps);

        verificationService.sendResetCode("alice@example.com", "EMAIL", false);

        verify(valueOps, never()).set(eq("otp:reset:alice@example.com"), anyString(), anyLong(), eq(TimeUnit.SECONDS));
        verify(emailService, never()).sendCode(anyString(), anyString());
    }

    @Test
    void sendResetCode_enforcesCooldown() {
        when(redis.hasKey("otp:reset:cooldown:alice@example.com")).thenReturn(true);

        assertThrows(TooManyRequestsException.class,
                () -> verificationService.sendResetCode("alice@example.com", "EMAIL", true));
    }

    @Test
    void verifyResetCode_acceptsMatchingCodeAndDeletesKey() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("otp:reset:alice@example.com")).thenReturn("654321");

        verificationService.verifyResetCode("alice@example.com", "654321");

        verify(redis).delete("otp:reset:alice@example.com");
    }
}
