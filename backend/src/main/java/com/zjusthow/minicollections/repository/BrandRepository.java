package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.BrandEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends ListCrudRepository<BrandEntity, Long> {

    Optional<List<BrandEntity>> findByName(String brandName);

    Optional<BrandEntity> findById(Long brandId);

    boolean existsById(Long brandId);

    Optional<List<BrandEntity>> findByNameContainingIgnoreCase(String keyword);
}
