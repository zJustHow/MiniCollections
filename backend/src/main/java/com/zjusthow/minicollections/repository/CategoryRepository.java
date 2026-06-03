package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.CategoryEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends ListCrudRepository<CategoryEntity, Long> {

    List<CategoryEntity> findAllByOrderBySortOrderAscIdAsc();
}
