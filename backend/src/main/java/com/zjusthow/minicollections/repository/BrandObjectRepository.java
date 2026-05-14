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
}