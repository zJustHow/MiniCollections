package com.zjusthow.minicollections.i18n;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.service.UserService;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Locale;

@Component
public class DisplayLocaleResolver {

    private final UserService userService;

    public DisplayLocaleResolver(UserService userService) {
        this.userService = userService;
    }

    public String resolveEffectiveLocale(String acceptLanguage, User user) {
        UserEntity ue = null;
        if (user != null) {
            try {
                ue = userService.getUserById(Long.parseLong(user.getUsername()));
            } catch (Exception ignored) {}
        }
        return resolveEffectiveLocale(acceptLanguage, ue);
    }

    public String resolveEffectiveLocale(String acceptLanguage, UserEntity user) {
        if (user != null && user.preferredLocale() != null && !user.preferredLocale().isBlank()) {
            return user.preferredLocale().strip();
        }
        if (acceptLanguage != null && !acceptLanguage.isBlank()) {
            String first = acceptLanguage.split(",")[0].strip().split(";")[0].strip();
            if (!first.isBlank()) {
                return first;
            }
        }
        return "en-US";
    }

    public boolean prefersZh(String effectiveLocale) {
        return Locale.forLanguageTag(effectiveLocale.replace('_', '-')).getLanguage().equalsIgnoreCase("zh");
    }

    public boolean prefersCny(String effectiveLocale) {
        return prefersZh(effectiveLocale);
    }

    public static String pickName(String nameEn, String nameZh, boolean preferZh) {
        if (preferZh) {
            return firstNonBlank(nameZh, nameEn);
        }
        return firstNonBlank(nameEn, nameZh);
    }

    public static String pickCategory(String catEn, String catZh, boolean preferZh) {
        if (preferZh) {
            return firstNonBlank(catZh, catEn);
        }
        return firstNonBlank(catEn, catZh);
    }

    public static BigDecimal pickPrice(BigDecimal cny, BigDecimal usd, boolean preferCny) {
        if (preferCny) {
            return firstNonNull(cny, usd);
        }
        return firstNonNull(usd, cny);
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return "";
    }

    private static BigDecimal firstNonNull(BigDecimal a, BigDecimal b) {
        return a != null ? a : b;
    }
}
