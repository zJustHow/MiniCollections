package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.BrandEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends ListCrudRepository<BrandEntity, Long> {

    @Query("SELECT COUNT(*) FROM brands")
    long countAll();

    @Query("SELECT * FROM brands ORDER BY id ASC LIMIT :limit OFFSET :offset")
    List<BrandEntity> findPage(@Param("limit") int limit, @Param("offset") int offset);

    @Query("""
            SELECT * FROM brands
            WHERE LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
            ORDER BY id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<BrandEntity> searchPage(
            @Param("keyword") String keyword,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
            SELECT COUNT(*) FROM brands
            WHERE LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
            """)
    long countSearch(@Param("keyword") String keyword);
}
