package com.zjusthow.minicollections;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DisplayLocaleResolverTest {

    private final DisplayLocaleResolver displayLocaleResolver = new DisplayLocaleResolver(null);

    @Test
    void prefersZh_forChineseLocales() {
        assertTrue(displayLocaleResolver.prefersZh("zh-CN"));
        assertFalse(displayLocaleResolver.prefersZh("en-US"));
    }

    @Test
    void defaultGroupName_followsLocale() {
        assertEquals("默认", DisplayLocaleResolver.defaultGroupName("zh-CN"));
        assertEquals("default", DisplayLocaleResolver.defaultGroupName("en-US"));
    }

    @Test
    void isDefaultGroupName_recognizesBothLocales() {
        assertTrue(DisplayLocaleResolver.isDefaultGroupName("default"));
        assertTrue(DisplayLocaleResolver.isDefaultGroupName("默认"));
        assertFalse(DisplayLocaleResolver.isDefaultGroupName("My Group"));
    }

    @Test
    void resolveEffectiveLocale_prefersUserPreference() {
        UserEntity user = new UserEntity(1L, "Alice", "hash", true, "zh-CN", null);
        assertEquals("zh-CN", displayLocaleResolver.resolveEffectiveLocale("en-US", user));
    }

    @Test
    void resolveEffectiveLocale_fallsBackToAcceptLanguage() {
        assertEquals("zh-TW", displayLocaleResolver.resolveEffectiveLocale("zh-TW,en;q=0.9", (UserEntity) null));
    }

    @Test
    void resolveEffectiveLocale_defaultsToEnUs() {
        assertEquals("en-US", displayLocaleResolver.resolveEffectiveLocale(null, (UserEntity) null));
        assertEquals("en-US", displayLocaleResolver.resolveEffectiveLocale("  ", (UserEntity) null));
    }

    @Test
    void pickName_prefersRequestedLocaleWithFallback() {
        assertEquals("中文", DisplayLocaleResolver.pickName("English", "中文", true));
        assertEquals("English", DisplayLocaleResolver.pickName("English", "中文", false));
        assertEquals("English", DisplayLocaleResolver.pickName("English", null, true));
        assertEquals("中文", DisplayLocaleResolver.pickName(null, "中文", false));
        assertEquals("", DisplayLocaleResolver.pickName(null, null, true));
    }

    @Test
    void pickCategory_prefersRequestedLocaleWithFallback() {
        assertEquals("跑车", DisplayLocaleResolver.pickCategory("Sports", "跑车", true));
        assertEquals("Sports", DisplayLocaleResolver.pickCategory("Sports", "跑车", false));
    }
}
