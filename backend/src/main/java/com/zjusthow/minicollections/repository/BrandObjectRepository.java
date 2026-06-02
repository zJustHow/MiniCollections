package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.model.BrandObjectIdCount;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BrandObjectRepository extends ListCrudRepository<BrandObjectEntity, Long> {

    Optional<List<BrandObjectEntity>> findByBrandId(Long brandId);

    @Query("""
            SELECT * FROM brand_objects
            WHERE LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
            """)
    List<BrandObjectEntity> searchByName(@Param("keyword") String keyword);

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

    @Modifying
    @Query("UPDATE brand_objects SET view_count = COALESCE(view_count, 0) + 1 WHERE id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("""
            SELECT brand_object_id, COUNT(*)::bigint AS add_count
            FROM user_objects
            WHERE brand_object_id IS NOT NULL
              AND brand_object_id IN (:ids)
            GROUP BY brand_object_id
            """)
    List<BrandObjectIdCount> countGroupAddsByBrandObjectIds(@Param("ids") Collection<Long> ids);
}