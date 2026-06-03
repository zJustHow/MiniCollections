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
    private final SeriesRepository seriesRepository;
    private final CategoryRepository categoryRepository;
    private final ScaleRepository scaleRepository;
    private final BrandObjectSearchRepository brandObjectSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    public BrandObjectIndexInitializer(
            BrandObjectRepository brandObjectRepository,
            BrandRepository brandRepository,
            SeriesRepository seriesRepository,
            CategoryRepository categoryRepository,
            ScaleRepository scaleRepository,
            BrandObjectSearchRepository brandObjectSearchRepository,
            ElasticsearchOperations elasticsearchOperations) {
        this.brandObjectRepository = brandObjectRepository;
        this.brandRepository = brandRepository;
        this.seriesRepository = seriesRepository;
        this.categoryRepository = categoryRepository;
        this.scaleRepository = scaleRepository;
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
            Map<Long, SeriesEntity> seriesById = ((List<SeriesEntity>) seriesRepository.findAll())
                    .stream().collect(Collectors.toMap(SeriesEntity::id, s -> s));
            Map<Long, CategoryEntity> categoryById = ((List<CategoryEntity>) categoryRepository.findAll())
                    .stream().collect(Collectors.toMap(CategoryEntity::id, c -> c));
            Map<Long, ScaleEntity> scaleById = ((List<ScaleEntity>) scaleRepository.findAll())
                    .stream().collect(Collectors.toMap(ScaleEntity::id, s -> s));

            List<BrandObjectEntity> all = (List<BrandObjectEntity>) brandObjectRepository.findAll();
            List<BrandObjectDocument> docs = all.stream().map(e -> {
                BrandEntity brand = brandById.get(e.brandId());
                SeriesEntity series = e.seriesId() != null ? seriesById.get(e.seriesId()) : null;
                CategoryEntity category = e.categoryId() != null ? categoryById.get(e.categoryId()) : null;
                ScaleEntity scale = e.scaleId() != null ? scaleById.get(e.scaleId()) : null;
                return BrandObjectDocument.from(
                        e,
                        brand != null ? brand.nameEn() : null,
                        brand != null ? brand.nameZh() : null,
                        series != null ? series.nameEn() : null,
                        series != null ? series.nameZh() : null,
                        category != null ? category.nameEn() : null,
                        category != null ? category.nameZh() : null,
                        scale != null ? scale.code() : null);
            }).toList();
            brandObjectSearchRepository.saveAll(docs);
            log.info("Elasticsearch brand-objects index refreshed ({} documents)", docs.size());
        } catch (Exception e) {
            log.warn("Could not refresh Elasticsearch index: {}", e.getMessage());
        }
    }
}
