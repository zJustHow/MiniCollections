package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandObjectRepository extends ListCrudRepository<BrandObjectEntity, Long> {

    Optional<List<BrandObjectEntity>> findByBrandId(Long brandId);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId
            ORDER BY id ASC
            LIMIT :limit
            """)
    List<BrandObjectEntity> findFirstPageByBrandId(
            @Param("brandId") Long brandId,
            @Param("limit") int limit);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId AND id > :afterId
            ORDER BY id ASC
            LIMIT :limit
            """)
    List<BrandObjectEntity> findAfterIdByBrandId(
            @Param("brandId") Long brandId,
            @Param("afterId") Long afterId,
            @Param("limit") int limit);

    @Query("""
            SELECT * FROM brand_objects
            WHERE LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
            ORDER BY id ASC
            LIMIT :limit
            """)
    List<BrandObjectEntity> searchFirstPage(@Param("keyword") String keyword, @Param("limit") int limit);

    @Query("""
            SELECT * FROM brand_objects
            WHERE id > :afterId
              AND (LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            ORDER BY id ASC
            LIMIT :limit
            """)
    List<BrandObjectEntity> searchAfterId(
            @Param("keyword") String keyword,
            @Param("afterId") Long afterId,
            @Param("limit") int limit);

    @Query("""
            SELECT COUNT(*) FROM brand_objects
            WHERE LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
            """)
    long countSearch(@Param("keyword") String keyword);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId
              AND (LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            ORDER BY id ASC
            LIMIT :limit
            """)
    List<BrandObjectEntity> searchFirstPageWithinBrand(
            @Param("keyword") String keyword,
            @Param("brandId") Long brandId,
            @Param("limit") int limit);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId
              AND id > :afterId
              AND (LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            ORDER BY id ASC
            LIMIT :limit
            """)
    List<BrandObjectEntity> searchAfterIdWithinBrand(
            @Param("keyword") String keyword,
            @Param("brandId") Long brandId,
            @Param("afterId") Long afterId,
            @Param("limit") int limit);

    @Query("""
            SELECT COUNT(*) FROM brand_objects
            WHERE brand_id = :brandId
              AND (LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            """)
    long countSearchWithinBrand(@Param("keyword") String keyword, @Param("brandId") Long brandId);

    @Query("""
            SELECT bo.* FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
            """)
    List<BrandObjectEntity> searchByNameOrBrandName(@Param("keyword") String keyword);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId
              AND (LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            """)
    List<BrandObjectEntity> searchByNameWithinBrand(@Param("keyword") String keyword, @Param("brandId") Long brandId);
}
