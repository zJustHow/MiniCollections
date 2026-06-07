package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ElasticsearchIndexBootstrap {

    private static final Logger log = LoggerFactory.getLogger(ElasticsearchIndexBootstrap.class);

    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final SeriesRepository seriesRepository;
    private final CategoryRepository categoryRepository;
    private final ScaleRepository scaleRepository;
    private final BrandSearchRepository brandSearchRepository;
    private final BrandObjectSearchRepository brandObjectSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    @Value("${app.elasticsearch.reindex-on-startup:false}")
    private boolean reindexOnStartup;

    public ElasticsearchIndexBootstrap(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            SeriesRepository seriesRepository,
            CategoryRepository categoryRepository,
            ScaleRepository scaleRepository,
            BrandSearchRepository brandSearchRepository,
            BrandObjectSearchRepository brandObjectSearchRepository,
            ElasticsearchOperations elasticsearchOperations) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.seriesRepository = seriesRepository;
        this.categoryRepository = categoryRepository;
        this.scaleRepository = scaleRepository;
        this.brandSearchRepository = brandSearchRepository;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureIndexes() {
        if (!elasticsearchEnabled) {
            log.debug("Elasticsearch disabled, skipping index bootstrap");
            return;
        }
        ensureBrandIndex();
        ensureBrandObjectIndex();
    }

    private void ensureBrandIndex() {
        try {
            IndexOperations indexOps = elasticsearchOperations.indexOps(BrandDocument.class);
            long dbCount = brandRepository.count();
            if (shouldRebuild(indexOps, brandSearchRepository.count(), dbCount, "brands")) {
                rebuildBrandIndex(indexOps, dbCount);
            } else {
                log.info(
                        "Elasticsearch brands index up to date ({} documents), skipping startup reindex",
                        brandSearchRepository.count());
            }
        } catch (Exception e) {
            log.warn("Could not ensure Elasticsearch brands index: {}", e.getMessage());
        }
    }

    private void ensureBrandObjectIndex() {
        try {
            IndexOperations indexOps = elasticsearchOperations.indexOps(BrandObjectDocument.class);
            long dbCount = brandObjectRepository.count();
            if (shouldRebuild(indexOps, brandObjectSearchRepository.count(), dbCount, "brand-objects")) {
                rebuildBrandObjectIndex(indexOps, dbCount);
            } else {
                log.info(
                        "Elasticsearch brand-objects index up to date ({} documents), skipping startup reindex",
                        brandObjectSearchRepository.count());
            }
        } catch (Exception e) {
            log.warn("Could not ensure Elasticsearch brand-objects index: {}", e.getMessage());
        }
    }

    private boolean shouldRebuild(
            IndexOperations indexOps, long indexedCount, long dbCount, String indexLabel) {
        if (reindexOnStartup) {
            log.info("Elasticsearch {} reindex-on-startup enabled, rebuilding index", indexLabel);
            return true;
        }
        if (!indexOps.exists()) {
            log.info("Elasticsearch {} index missing, creating and indexing", indexLabel);
            return true;
        }
        if (indexedCount == 0 && dbCount > 0) {
            log.info("Elasticsearch {} index empty but database has {} rows, indexing", indexLabel, dbCount);
            return true;
        }
        return false;
    }

    private void rebuildBrandIndex(IndexOperations indexOps, long expectedCount) {
        if (indexOps.exists()) {
            indexOps.delete();
        }
        indexOps.createWithMapping();

        List<BrandEntity> all = (List<BrandEntity>) brandRepository.findAll();
        List<BrandDocument> docs = all.stream().map(BrandDocument::from).toList();
        brandSearchRepository.saveAll(docs);
        log.info("Elasticsearch brands index built ({} documents, db count {})", docs.size(), expectedCount);
    }

    private void rebuildBrandObjectIndex(IndexOperations indexOps, long expectedCount) {
        if (indexOps.exists()) {
            indexOps.delete();
        }
        indexOps.createWithMapping();

        Map<Long, BrandEntity> brandById = ((List<BrandEntity>) brandRepository.findAll())
                .stream().collect(Collectors.toMap(BrandEntity::id, b -> b));
        Map<Long, SeriesEntity> seriesById = ((List<SeriesEntity>) seriesRepository.findAll())
                .stream().collect(Collectors.toMap(SeriesEntity::id, s -> s));
        Map<Long, CategoryEntity> categoryById = ((List<CategoryEntity>) categoryRepository.findAll())
                .stream().collect(Collectors.toMap(CategoryEntity::id, c -> c));
        Map<Long, ScaleEntity> scaleById = ((List<ScaleEntity>) scaleRepository.findAll())
                .stream().collect(Collectors.toMap(ScaleEntity::id, s -> s));

        List<BrandObjectEntity> all = (List<BrandObjectEntity>) brandObjectRepository.findAll();
        List<BrandObjectDocument> docs = all.stream()
                .map(e -> toBrandObjectDocument(e, brandById, seriesById, categoryById, scaleById))
                .toList();
        brandObjectSearchRepository.saveAll(docs);
        log.info(
                "Elasticsearch brand-objects index built ({} documents, db count {})",
                docs.size(),
                expectedCount);
    }

    static BrandObjectDocument toBrandObjectDocument(
            BrandObjectEntity entity,
            Map<Long, BrandEntity> brandById,
            Map<Long, SeriesEntity> seriesById,
            Map<Long, CategoryEntity> categoryById,
            Map<Long, ScaleEntity> scaleById) {
        BrandEntity brand = brandById.get(entity.brandId());
        SeriesEntity series = entity.seriesId() != null ? seriesById.get(entity.seriesId()) : null;
        CategoryEntity category = entity.categoryId() != null ? categoryById.get(entity.categoryId()) : null;
        ScaleEntity scale = entity.scaleId() != null ? scaleById.get(entity.scaleId()) : null;
        return BrandObjectDocument.from(
                entity,
                brand != null ? brand.nameEn() : null,
                brand != null ? brand.abbreviation() : null,
                brand != null ? brand.nameZh() : null,
                series != null ? series.nameEn() : null,
                series != null ? series.nameZh() : null,
                category != null ? category.nameEn() : null,
                category != null ? category.nameZh() : null,
                scale != null ? scale.code() : null);
    }
}
