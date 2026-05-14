package com.zjusthow.minicollections.elasticsearch;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandSearchRepository extends ElasticsearchRepository<BrandDocument, Long> {
}
