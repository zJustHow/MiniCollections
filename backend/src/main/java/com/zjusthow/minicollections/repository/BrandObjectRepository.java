package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BrandObjectRepository extends ListCrudRepository<BrandObjectEntity, Long> {
    Optional<List<BrandObjectEntity>> findByName(String brandObjectName);

    Optional<List<BrandObjectEntity>> findByBrandId(Long brandId);

    @Query("SELECT * FROM brand_objects WHERE LOWER(name) LIKE '%' || LOWER(:keyword) || '%'")
    List<BrandObjectEntity> searchByName(@Param("keyword") String keyword);
}