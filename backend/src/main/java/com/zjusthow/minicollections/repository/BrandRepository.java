package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.BrandEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends ListCrudRepository<BrandEntity, Long> {
}
