package com.zjusthow.minicollections.elasticsearch;

import java.util.List;

public record EsSearchPageResult(
        List<Long> ids,
        long totalElements,
        boolean totalExact
) {
}
