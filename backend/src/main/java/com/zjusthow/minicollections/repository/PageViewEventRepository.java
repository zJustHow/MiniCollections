package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.PageViewEventEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface PageViewEventRepository extends ListCrudRepository<PageViewEventEntity, Long> {

    @Modifying
    @Query("DELETE FROM page_view_events WHERE viewed_at < :cutoff")
    long deleteOlderThan(@Param("cutoff") Instant cutoff);
}
