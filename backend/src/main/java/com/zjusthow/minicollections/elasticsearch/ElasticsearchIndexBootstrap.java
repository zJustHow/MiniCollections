package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.repository.BrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class ElasticsearchIndexBootstrap {

    private static final Logger log = LoggerFactory.getLogger(ElasticsearchIndexBootstrap.class);

    private final BrandRepository brandRepository;
    private final BrandSearchRepository brandSearchRepository;
    private final SearchIndexMetaRepository searchIndexMetaRepository;
    private final BrandObjectIndexService brandObjectIndexService;
    private final ElasticsearchOperations elasticsearchOperations;
    private final Environment environment;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    @Value("${app.elasticsearch.reindex-on-startup:false}")
    private boolean reindexOnStartup;

    public ElasticsearchIndexBootstrap(
            BrandRepository brandRepository,
            BrandSearchRepository brandSearchRepository,
            @Autowired(required = false) SearchIndexMetaRepository searchIndexMetaRepository,
            BrandObjectIndexService brandObjectIndexService,
            ElasticsearchOperations elasticsearchOperations,
            Environment environment) {
        this.brandRepository = brandRepository;
        this.brandSearchRepository = brandSearchRepository;
        this.searchIndexMetaRepository = searchIndexMetaRepository;
        this.brandObjectIndexService = brandObjectIndexService;
        this.elasticsearchOperations = elasticsearchOperations;
        this.environment = environment;
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
            if (shouldRebuildBrandIndex(indexOps, brandSearchRepository.count(), dbCount)) {
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
        if (isDevProfile()) {
            log.debug("Dev profile: brand-object index rebuild deferred to DevBrandObjectIndexSync");
            return;
        }
        brandObjectIndexService.ensureIndexFresh(reindexOnStartup);
    }

    private boolean isDevProfile() {
        return Arrays.stream(environment.getActiveProfiles()).anyMatch("dev"::equals);
    }

    private boolean shouldRebuildBrandIndex(
            IndexOperations indexOps, long indexedCount, long dbCount) {
        if (reindexOnStartup) {
            log.info("Elasticsearch brands reindex-on-startup enabled, rebuilding index");
            return true;
        }
        if (!indexOps.exists()) {
            log.info("Elasticsearch brands index missing, creating and indexing");
            return true;
        }
        if (indexedCount == 0 && dbCount > 0) {
            log.info("Elasticsearch brands index empty but database has {} rows, indexing", dbCount);
            return true;
        }
        if (dbCount > 0 && indexedCount < dbCount) {
            log.info(
                    "Elasticsearch brands index incomplete ({} indexed, {} in db), reindexing",
                    indexedCount,
                    dbCount);
            return true;
        }
        if (isBrandIndexVersionStale()) {
            log.info(
                    "Elasticsearch brands index version mismatch (expected {})",
                    BrandIndexVersion.CURRENT);
            return true;
        }
        return false;
    }

    private boolean isBrandIndexVersionStale() {
        if (searchIndexMetaRepository == null) {
            return true;
        }
        return searchIndexMetaRepository.findById(BrandIndexVersion.META_ID)
                .map(meta -> meta.version() != BrandIndexVersion.CURRENT)
                .orElse(true);
    }

    private void rebuildBrandIndex(IndexOperations indexOps, long expectedCount) {
        if (indexOps.exists()) {
            indexOps.delete();
        }
        indexOps.createWithMapping();

        List<BrandEntity> all = (List<BrandEntity>) brandRepository.findAll();
        List<BrandDocument> docs = all.stream().map(BrandDocument::from).toList();
        brandSearchRepository.saveAll(docs);
        if (searchIndexMetaRepository != null) {
            searchIndexMetaRepository.save(new SearchIndexMetaDocument(
                    BrandIndexVersion.META_ID,
                    BrandIndexVersion.CURRENT));
        }
        log.info(
                "Elasticsearch brands index built ({} documents, db count {}, version {})",
                docs.size(),
                expectedCount,
                BrandIndexVersion.CURRENT);
    }
}
