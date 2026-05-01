package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.exception.InvalidCodeException;
import com.zjusthow.minicollections.exception.TooManyRequestsException;
import com.zjusthow.minicollections.service.sms.SmsSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Service
public class VerificationService {

    private static final String PREFIX = "otp:";

    private final StringRedisTemplate redis;
    private final EmailService emailService;
    private final SmsSender smsSender;

    @Value("${app.verification.otp-ttl-seconds:300}")
    private int otpTtlSeconds;

    @Value("${app.verification.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    public VerificationService(StringRedisTemplate redis, EmailService emailService, SmsSender smsSender) {
        this.redis = redis;
        this.emailService = emailService;
        this.smsSender = smsSender;
    }

    public void sendCode(String target, String type) {
        String key = PREFIX + target;
        Long ttl = redis.getExpire(key, TimeUnit.SECONDS);
        if (ttl != null && ttl > otpTtlSeconds - resendCooldownSeconds) {
            throw new TooManyRequestsException("Please wait before requesting another code");
        }

        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
        redis.opsForValue().set(key, code, otpTtlSeconds, TimeUnit.SECONDS);

        if ("EMAIL".equals(type)) {
            emailService.sendCode(target, code);
        } else if ("PHONE".equals(type)) {
            smsSender.send(target, code);
        } else {
            throw new IllegalArgumentException("Invalid type: " + type);
        }
    }

    public void verify(String target, String code) {
        String key = PREFIX + target;
        String stored = redis.opsForValue().get(key);
        if (stored == null) throw new InvalidCodeException("Verification code expired or not found");
        if (!stored.equals(code)) throw new InvalidCodeException("Invalid verification code");
        redis.delete(key);
    }
}
