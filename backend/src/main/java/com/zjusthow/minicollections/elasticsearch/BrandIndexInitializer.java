package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.repository.BrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BrandIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(BrandIndexInitializer.class);

    private final BrandRepository brandRepository;
    private final BrandSearchRepository brandSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    public BrandIndexInitializer(
            BrandRepository brandRepository,
            BrandSearchRepository brandSearchRepository,
            ElasticsearchOperations elasticsearchOperations) {
        this.brandRepository = brandRepository;
        this.brandSearchRepository = brandSearchRepository;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void reindexAll() {
        try {
            IndexOperations indexOps = elasticsearchOperations.indexOps(BrandDocument.class);
            if (indexOps.exists()) {
                indexOps.delete();
            }
            indexOps.createWithMapping();

            List<BrandEntity> all = (List<BrandEntity>) brandRepository.findAll();
            List<BrandDocument> docs = all.stream().map(BrandDocument::from).toList();
            brandSearchRepository.saveAll(docs);
            log.info("Elasticsearch brands index refreshed ({} documents)", docs.size());
        } catch (Exception e) {
            log.warn("Could not refresh Elasticsearch brands index: {}", e.getMessage());
        }
    }
}
