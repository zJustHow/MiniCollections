package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.query.UpdateQuery;
import org.springframework.stereotype.Service;

@Service
public class ViewCountElasticsearchSyncService {

    private static final Logger log = LoggerFactory.getLogger(ViewCountElasticsearchSyncService.class);

    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    public ViewCountElasticsearchSyncService(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            @Autowired(required = false) ElasticsearchOperations elasticsearchOperations) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    public void syncBrandViewCount(long brandId) {
        if (!isEnabled()) {
            return;
        }
        brandRepository.findById(brandId).ifPresent(brand -> {
            try {
                Document doc = Document.create();
                doc.put("view_count", brand.viewCount());
                UpdateQuery query = UpdateQuery.builder(String.valueOf(brandId))
                        .withDocument(doc)
                        .build();
                elasticsearchOperations.update(
                        query,
                        elasticsearchOperations.getIndexCoordinatesFor(BrandDocument.class));
            } catch (Exception e) {
                log.warn("Failed to sync brand view_count to Elasticsearch for id={}: {}", brandId, e.getMessage());
            }
        });
    }

    public void syncModelViewCount(long modelId) {
        if (!isEnabled()) {
            return;
        }
        brandObjectRepository.findById(modelId).ifPresent(model -> {
            try {
                Document doc = Document.create();
                doc.put("view_count", model.viewCount());
                UpdateQuery query = UpdateQuery.builder(String.valueOf(modelId))
                        .withDocument(doc)
                        .build();
                elasticsearchOperations.update(
                        query,
                        elasticsearchOperations.getIndexCoordinatesFor(BrandObjectDocument.class));
            } catch (Exception e) {
                log.warn("Failed to sync model view_count to Elasticsearch for id={}: {}", modelId, e.getMessage());
            }
        });
    }

    private boolean isEnabled() {
        return elasticsearchEnabled && elasticsearchOperations != null;
    }
}
