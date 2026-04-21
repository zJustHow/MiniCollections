package com.zjusthow.minicollections;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = DisplayLocaleResolver.class)
class DisplayLocaleResolverTest {

    @Autowired
    DisplayLocaleResolver displayLocaleResolver;

    @Test
    void prefersZh_forChineseLocales() {
        assertTrue(displayLocaleResolver.prefersZh("zh-CN"));
        assertFalse(displayLocaleResolver.prefersZh("en-US"));
    }
}
