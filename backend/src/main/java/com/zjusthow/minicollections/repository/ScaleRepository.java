package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.ScaleEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScaleRepository extends ListCrudRepository<ScaleEntity, Long> {

    List<ScaleEntity> findAllByOrderBySortOrderAscDenominatorAscIdAsc();
}
