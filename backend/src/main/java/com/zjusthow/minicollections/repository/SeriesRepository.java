package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.SeriesEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeriesRepository extends ListCrudRepository<SeriesEntity, Long> {

    List<SeriesEntity> findByBrandIdOrderByIdAsc(Long brandId);
}
