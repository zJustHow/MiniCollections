package com.zjusthow.minicollections.elasticsearch;

/**
 * Normalizes user search keywords so compound brand names match across analyzers.
 * Example: "auto art" also matches indexed "AutoArt" when word_delimiter is unavailable.
 */
public final class SearchKeywordNormalizer {

    private SearchKeywordNormalizer() {
    }

    public static String compact(String keyword) {
        if (keyword == null) {
            return "";
        }
        return keyword
                .trim()
                .toLowerCase()
                .replaceAll("[\\s\\-]+", "");
    }

    public static boolean hasSeparators(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return false;
        }
        return keyword.indexOf(' ') >= 0 || keyword.indexOf('-') >= 0;
    }
}
