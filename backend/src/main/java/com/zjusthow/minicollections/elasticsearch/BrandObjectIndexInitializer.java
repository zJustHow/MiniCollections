package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BrandObjectIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(BrandObjectIndexInitializer.class);

    private final BrandObjectRepository brandObjectRepository;
    private final BrandObjectSearchRepository brandObjectSearchRepository;

    public BrandObjectIndexInitializer(
            BrandObjectRepository brandObjectRepository,
            BrandObjectSearchRepository brandObjectSearchRepository) {
        this.brandObjectRepository = brandObjectRepository;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void reindexAll() {
        try {
            List<BrandObjectEntity> all = (List<BrandObjectEntity>) brandObjectRepository.findAll();
            List<BrandObjectDocument> docs = all.stream().map(this::toDoc).toList();
            brandObjectSearchRepository.saveAll(docs);
            log.info("Elasticsearch brand-objects index refreshed ({} documents)", docs.size());
        } catch (Exception e) {
            log.warn("Could not refresh Elasticsearch index: {}", e.getMessage());
        }
    }

    private BrandObjectDocument toDoc(BrandObjectEntity e) {
        return new BrandObjectDocument(
                e.id(),
                e.brandId(),
                e.nameEn(),
                e.nameZh(),
                e.imageUrl(),
                e.releasePriceCny(),
                e.releasePriceUsd(),
                e.releaseDate(),
                e.categoryEn(),
                e.categoryZh(),
                e.scale()
        );
    }
}
