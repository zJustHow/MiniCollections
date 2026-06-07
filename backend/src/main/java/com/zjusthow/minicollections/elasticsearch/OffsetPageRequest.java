package com.zjusthow.minicollections.elasticsearch;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Pageable with an explicit offset (not only page-number × page-size).
 * Used so Elasticsearch queries can use {@code from}/{@code size} directly.
 */
record OffsetPageRequest(int offset, int limit) implements Pageable {

    OffsetPageRequest {
        offset = Math.max(offset, 0);
        limit = Math.max(limit, 1);
    }

    @Override
    public int getPageNumber() {
        return limit == 0 ? 0 : offset / limit;
    }

    @Override
    public int getPageSize() {
        return limit;
    }

    @Override
    public long getOffset() {
        return offset;
    }

    @Override
    public Sort getSort() {
        return Sort.unsorted();
    }

    @Override
    public Pageable next() {
        return new OffsetPageRequest(offset + limit, limit);
    }

    @Override
    public Pageable previousOrFirst() {
        return offset <= limit ? first() : new OffsetPageRequest(offset - limit, limit);
    }

    @Override
    public Pageable first() {
        return new OffsetPageRequest(0, limit);
    }

    @Override
    public Pageable withPage(int pageNumber) {
        return new OffsetPageRequest(Math.max(pageNumber, 0) * limit, limit);
    }

    @Override
    public boolean hasPrevious() {
        return offset > 0;
    }
}
