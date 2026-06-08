package com.zjusthow.minicollections;

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
}
