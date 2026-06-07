package com.zjusthow.minicollections.elasticsearch;

import java.util.regex.Pattern;

/**
 * Expands brand display names for Elasticsearch indexing only.
 * {@code MINI GT (MGT)} becomes {@code MINI GT MGT MINIGT} so queries like {@code minigt} and {@code mgt} match.
 */
public final class BrandNameForSearch {

    private static final Pattern NAME_WITH_ABBREVIATION =
            Pattern.compile("^(.+?)\\s*\\(([^)]+)\\)$");

    private BrandNameForSearch() {
    }

    public static String forIndex(String nameEn) {
        if (nameEn == null || nameEn.isBlank()) {
            return nameEn;
        }
        var trimmed = nameEn.trim();
        var matcher = NAME_WITH_ABBREVIATION.matcher(trimmed);
        if (!matcher.matches()) {
            return trimmed;
        }
        String base = matcher.group(1).trim();
        String abbr = matcher.group(2).trim();
        if (base.isEmpty() || abbr.isEmpty()) {
            return trimmed;
        }
        // Lowercase so brand_wdg keeps it as one token (TimeMicro would split on camelCase).
        String joined = base.replaceAll("\\s+", "").toLowerCase();
        return base + " " + abbr + " " + joined;
    }
}
