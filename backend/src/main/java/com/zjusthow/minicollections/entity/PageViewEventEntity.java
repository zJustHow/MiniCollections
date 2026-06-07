package com.zjusthow.minicollections.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("page_view_events")
public record PageViewEventEntity(
        @Id Long id,
        String entityType,
        Long entityId,
        String visitorHash,
        Instant viewedAt
) {
}
