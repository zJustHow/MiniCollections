package com.zjusthow.minicollections.elasticsearch;

import java.util.List;

public record EsSearchSliceResult(
        List<Long> ids,
        List<Object> nextSortValues,
        Long totalElements,
        boolean totalExact,
        boolean hasMore
) {
}
