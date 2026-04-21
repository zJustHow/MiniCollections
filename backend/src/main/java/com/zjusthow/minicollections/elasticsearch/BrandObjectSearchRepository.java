package com.zjusthow.minicollections.elasticsearch;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandObjectSearchRepository extends ElasticsearchRepository<BrandObjectDocument, Long> {
}
