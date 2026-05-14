package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class BrandObjectIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(BrandObjectIndexInitializer.class);

    private final BrandObjectRepository brandObjectRepository;
    private final BrandRepository brandRepository;
    private final BrandObjectSearchRepository brandObjectSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    public BrandObjectIndexInitializer(
            BrandObjectRepository brandObjectRepository,
            BrandRepository brandRepository,
            BrandObjectSearchRepository brandObjectSearchRepository,
            ElasticsearchOperations elasticsearchOperations) {
        this.brandObjectRepository = brandObjectRepository;
        this.brandRepository = brandRepository;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void reindexAll() {
        try {
            IndexOperations indexOps = elasticsearchOperations.indexOps(BrandObjectDocument.class);
            if (indexOps.exists()) {
                indexOps.delete();
            }
            indexOps.createWithMapping();

            Map<Long, BrandEntity> brandById = ((List<BrandEntity>) brandRepository.findAll())
                    .stream().collect(Collectors.toMap(BrandEntity::id, b -> b));

            List<BrandObjectEntity> all = (List<BrandObjectEntity>) brandObjectRepository.findAll();
            List<BrandObjectDocument> docs = all.stream().map(e -> {
                BrandEntity brand = brandById.get(e.brandId());
                return BrandObjectDocument.from(
                        e,
                        brand != null ? brand.nameEn() : null,
                        brand != null ? brand.nameZh() : null);
            }).toList();
            brandObjectSearchRepository.saveAll(docs);
            log.info("Elasticsearch brand-objects index refreshed ({} documents)", docs.size());
        } catch (Exception e) {
            log.warn("Could not refresh Elasticsearch index: {}", e.getMessage());
        }
    }
}
