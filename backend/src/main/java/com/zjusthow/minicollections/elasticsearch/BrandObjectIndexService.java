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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BrandObjectIndexService {

    private static final Logger log = LoggerFactory.getLogger(BrandObjectIndexService.class);
    private static final int SAMPLE_SLICES = 5;
    private static final int SAMPLE_PER_SLICE = 10;
    private static final int INDEX_BATCH_SIZE = 500;

    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final SeriesRepository seriesRepository;
    private final CategoryRepository categoryRepository;
    private final ScaleRepository scaleRepository;
    private final BrandObjectSearchRepository brandObjectSearchRepository;
    private final SearchIndexMetaRepository searchIndexMetaRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    public BrandObjectIndexService(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            SeriesRepository seriesRepository,
            CategoryRepository categoryRepository,
            ScaleRepository scaleRepository,
            @Autowired(required = false) BrandObjectSearchRepository brandObjectSearchRepository,
            @Autowired(required = false) SearchIndexMetaRepository searchIndexMetaRepository,
            @Autowired(required = false) ElasticsearchOperations elasticsearchOperations) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.seriesRepository = seriesRepository;
        this.categoryRepository = categoryRepository;
        this.scaleRepository = scaleRepository;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
        this.searchIndexMetaRepository = searchIndexMetaRepository;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    public boolean isEnabled() {
        return elasticsearchEnabled
                && brandObjectSearchRepository != null
                && searchIndexMetaRepository != null
                && elasticsearchOperations != null;
    }

    /**
     * Ensures the brand-objects index matches the database unless {@code forceRebuild} is set.
     */
    public void ensureIndexFresh(boolean forceRebuild) {
        if (!isEnabled()) {
            return;
        }
        try {
            IndexOperations indexOps = elasticsearchOperations.indexOps(BrandObjectDocument.class);
            long dbCount = brandObjectRepository.countAll();
            long indexedCount = brandObjectSearchRepository.count();

            if (forceRebuild) {
                log.info("Elasticsearch brand-objects index force rebuild requested");
                rebuildAll(indexOps, dbCount);
                return;
            }
            if (shouldRebuild(indexOps, indexedCount, dbCount)) {
                rebuildAll(indexOps, dbCount);
                return;
            }
            if (isStoredVersionStale()) {
                log.info(
                        "Elasticsearch brand-objects index version mismatch (expected {})",
                        BrandObjectIndexVersion.CURRENT);
                rebuildAll(indexOps, dbCount);
                return;
            }
            if (isSampleStale()) {
                rebuildAll(indexOps, dbCount);
                return;
            }
            log.info(
                    "Elasticsearch brand-objects index up to date ({} documents, version {})",
                    indexedCount,
                    BrandObjectIndexVersion.CURRENT);
        } catch (Exception e) {
            log.warn("Could not ensure Elasticsearch brand-objects index: {}", e.getMessage());
        }
    }

    public void rebuildAll() {
        if (!isEnabled()) {
            return;
        }
        try {
            IndexOperations indexOps = elasticsearchOperations.indexOps(BrandObjectDocument.class);
            rebuildAll(indexOps, brandObjectRepository.countAll());
        } catch (Exception e) {
            log.warn("Could not rebuild Elasticsearch brand-objects index: {}", e.getMessage());
        }
    }

    public void index(BrandObjectEntity entity) {
        indexAll(List.of(entity));
    }

    public void delete(long id) {
        if (!isEnabled()) {
            return;
        }
        brandObjectSearchRepository.deleteById(id);
    }

    public void reindexForBrand(long brandId) {
        if (!isEnabled()) {
            return;
        }
        indexAll(brandObjectRepository.findByBrandId(brandId).orElse(List.of()));
    }

    public void reindexForSeries(long seriesId) {
        if (!isEnabled()) {
            return;
        }
        indexAll(brandObjectRepository.findBySeriesId(seriesId));
    }

    public void reindexForCategory(long categoryId) {
        if (!isEnabled()) {
            return;
        }
        indexAll(brandObjectRepository.findByCategoryId(categoryId));
    }

    public void reindexForScale(long scaleId) {
        if (!isEnabled()) {
            return;
        }
        indexAll(brandObjectRepository.findByScaleId(scaleId));
    }

    public void reindexByIds(Iterable<Long> ids) {
        if (!isEnabled()) {
            return;
        }
        List<BrandObjectEntity> entities = new ArrayList<>();
        brandObjectRepository.findAllById(ids).forEach(entities::add);
        indexAll(entities);
    }

    private void indexAll(List<BrandObjectEntity> entities) {
        if (!isEnabled() || entities.isEmpty()) {
            return;
        }
        RelationMaps maps = buildRelationMaps(entities);
        List<BrandObjectDocument> docs = entities.stream()
                .map(entity -> toDocument(
                        entity,
                        maps.brandById.get(entity.brandId()),
                        entity.seriesId() != null ? maps.seriesById.get(entity.seriesId()) : null,
                        entity.categoryId() != null ? maps.categoryById.get(entity.categoryId()) : null,
                        entity.scaleId() != null ? maps.scaleById.get(entity.scaleId()) : null))
                .toList();
        saveInBatches(docs);
    }

    private void saveInBatches(List<BrandObjectDocument> docs) {
        for (int offset = 0; offset < docs.size(); offset += INDEX_BATCH_SIZE) {
            int end = Math.min(offset + INDEX_BATCH_SIZE, docs.size());
            brandObjectSearchRepository.saveAll(docs.subList(offset, end));
        }
    }

    private RelationMaps buildRelationMaps(List<BrandObjectEntity> entities) {
        Set<Long> brandIds = new HashSet<>();
        Set<Long> seriesIds = new HashSet<>();
        Set<Long> categoryIds = new HashSet<>();
        Set<Long> scaleIds = new HashSet<>();
        for (BrandObjectEntity entity : entities) {
            brandIds.add(entity.brandId());
            if (entity.seriesId() != null) {
                seriesIds.add(entity.seriesId());
            }
            if (entity.categoryId() != null) {
                categoryIds.add(entity.categoryId());
            }
            if (entity.scaleId() != null) {
                scaleIds.add(entity.scaleId());
            }
        }
        Map<Long, BrandEntity> brandById = new HashMap<>();
        if (!brandIds.isEmpty()) {
            brandRepository.findAllById(brandIds).forEach(brand -> brandById.put(brand.id(), brand));
        }
        Map<Long, SeriesEntity> seriesById = new HashMap<>();
        if (!seriesIds.isEmpty()) {
            seriesRepository.findAllById(seriesIds).forEach(series -> seriesById.put(series.id(), series));
        }
        Map<Long, CategoryEntity> categoryById = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository.findAllById(categoryIds)
                    .forEach(category -> categoryById.put(category.id(), category));
        }
        Map<Long, ScaleEntity> scaleById = new HashMap<>();
        if (!scaleIds.isEmpty()) {
            scaleRepository.findAllById(scaleIds).forEach(scale -> scaleById.put(scale.id(), scale));
        }
        return new RelationMaps(brandById, seriesById, categoryById, scaleById);
    }

    private record RelationMaps(
            Map<Long, BrandEntity> brandById,
            Map<Long, SeriesEntity> seriesById,
            Map<Long, CategoryEntity> categoryById,
            Map<Long, ScaleEntity> scaleById) {}

    private boolean shouldRebuild(IndexOperations indexOps, long indexedCount, long dbCount) {
        if (!indexOps.exists()) {
            log.info("Elasticsearch brand-objects index missing, creating and indexing");
            return true;
        }
        if (indexedCount == 0 && dbCount > 0) {
            log.info("Elasticsearch brand-objects index empty but database has {} rows, indexing", dbCount);
            return true;
        }
        if (dbCount > 0 && indexedCount < dbCount) {
            log.info(
                    "Elasticsearch brand-objects index incomplete ({} indexed, {} in db), reindexing",
                    indexedCount,
                    dbCount);
            return true;
        }
        return false;
    }

    private boolean isStoredVersionStale() {
        return searchIndexMetaRepository.findById(BrandObjectIndexVersion.META_ID)
                .map(meta -> meta.version() != BrandObjectIndexVersion.CURRENT)
                .orElse(true);
    }

    /**
     * Compare denormalized filter fields across slices of the dataset (multiple offsets).
     */
    boolean isSampleStale() {
        long total = brandObjectRepository.countAll();
        if (total == 0) {
            return false;
        }
        List<BrandObjectEntity> sample = collectValidationSample(total);
        for (BrandObjectEntity entity : sample) {
            BrandObjectDocument doc = brandObjectSearchRepository.findById(entity.id()).orElse(null);
            if (doc == null) {
                log.info("Elasticsearch brand-objects index stale (missing document id {})", entity.id());
                return true;
            }
            if (!Objects.equals(doc.brandId(), entity.brandId())
                    || !Objects.equals(doc.categoryId(), entity.categoryId())
                    || !Objects.equals(doc.scaleId(), entity.scaleId())
                    || !Objects.equals(doc.seriesId(), entity.seriesId())) {
                log.info(
                        "Elasticsearch brand-objects index stale (id {} db brand/category/scale/series {}/{}/{}/{} vs es {}/{}/{}/{})",
                        entity.id(),
                        entity.brandId(),
                        entity.categoryId(),
                        entity.scaleId(),
                        entity.seriesId(),
                        doc.brandId(),
                        doc.categoryId(),
                        doc.scaleId(),
                        doc.seriesId());
                return true;
            }
        }
        return false;
    }

    List<BrandObjectEntity> collectValidationSample(long total) {
        Map<Long, BrandObjectEntity> unique = new LinkedHashMap<>();
        int sliceCount = Math.min(SAMPLE_SLICES, (int) Math.max(1, total));
        for (int slice = 0; slice < sliceCount; slice++) {
            long offset = slice == sliceCount - 1
                    ? Math.max(0L, total - SAMPLE_PER_SLICE)
                    : (total * slice) / sliceCount;
            for (BrandObjectEntity entity : brandObjectRepository.findPageOrderedById(
                    SAMPLE_PER_SLICE, (int) offset)) {
                unique.putIfAbsent(entity.id(), entity);
            }
        }
        return new ArrayList<>(unique.values());
    }

    private void rebuildAll(IndexOperations indexOps, long expectedCount) {
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
                .map(e -> toDocument(
                        e,
                        brandById.get(e.brandId()),
                        e.seriesId() != null ? seriesById.get(e.seriesId()) : null,
                        e.categoryId() != null ? categoryById.get(e.categoryId()) : null,
                        e.scaleId() != null ? scaleById.get(e.scaleId()) : null))
                .toList();
        saveInBatches(docs);
        searchIndexMetaRepository.save(new SearchIndexMetaDocument(
                BrandObjectIndexVersion.META_ID,
                BrandObjectIndexVersion.CURRENT));
        log.info(
                "Elasticsearch brand-objects index built ({} documents, db count {}, version {})",
                docs.size(),
                expectedCount,
                BrandObjectIndexVersion.CURRENT);
    }

    static BrandObjectDocument toDocument(
            BrandObjectEntity entity,
            BrandEntity brand,
            SeriesEntity series,
            CategoryEntity category,
            ScaleEntity scale) {
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
