package com.zjusthow.minicollections.elasticsearch;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchKeywordNormalizerTest {

    @Test
    void compact_removesSpacesAndHyphens() {
        assertEquals("autoart", SearchKeywordNormalizer.compact("auto art"));
        assertEquals("minigt", SearchKeywordNormalizer.compact("MINI GT"));
        assertEquals("topspeedmodel", SearchKeywordNormalizer.compact("top-speed model"));
    }

    @Test
    void hasSeparators_detectsSpaceAndHyphen() {
        assertTrue(SearchKeywordNormalizer.hasSeparators("auto art"));
        assertTrue(SearchKeywordNormalizer.hasSeparators("top-art"));
        assertFalse(SearchKeywordNormalizer.hasSeparators("autoart"));
        assertFalse(SearchKeywordNormalizer.hasSeparators("  "));
    }
}
