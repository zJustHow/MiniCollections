package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectElasticsearchQueryService;
import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class BrandService {

    private static final Logger log = LoggerFactory.getLogger(BrandService.class);

    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final BrandObjectElasticsearchQueryService elasticsearchQueryService;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    public BrandService(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            DisplayLocaleResolver displayLocaleResolver,
            @Autowired(required = false) BrandObjectElasticsearchQueryService elasticsearchQueryService) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.displayLocaleResolver = displayLocaleResolver;
        this.elasticsearchQueryService = elasticsearchQueryService;
    }

    private boolean esEnabled() {
        return elasticsearchEnabled && elasticsearchQueryService != null;
    }

    @Cacheable(
            value = "brands",
            key = "'all_' + #effectiveLocale"
    )
    public List<BrandDto> getBrands(String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return brandRepository.findAll().stream()
                .map(e -> BrandDto.from(e, preferZh))
                .toList();
    }

    @Cacheable(
            value = "brands",
            key = "'id_' + #id + '_' + #effectiveLocale"
    )
    public BrandDto getBrandById(long id, String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return brandRepository.findById(id)
                .map(e -> BrandDto.from(e, preferZh))
                .orElseThrow(BrandNotFoundException::new);
    }

    @Cacheable(
            value = "brands",
            key = "'search_' + #keyword + '_' + #effectiveLocale"
    )
    public List<BrandDto> searchBrands(String keyword, String effectiveLocale) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<BrandDto> brandDtos = getBrands(effectiveLocale);
        String lowerCaseKeyword = keyword.toLowerCase();
        return brandDtos.stream()
                .filter(brandDto -> brandDto.name().toLowerCase().contains(lowerCaseKeyword))
                .toList();
    }

    @Cacheable(
            value = "brandObjects",
            key = "'brandId_' + #brandId + '_' + #effectiveLocale"
    )
    public List<BrandObjectDto> getBrandObjectsByBrandId(long brandId, String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        boolean preferCny = displayLocaleResolver.prefersCny(effectiveLocale);
        return brandObjectRepository.findByBrandId(brandId)
                .orElse(Collections.emptyList())
                .stream()
                .map(e -> BrandObjectDto.from(e, preferZh, preferCny))
                .toList();
    }

    @Cacheable(
            value = "brandObjects",
            key = "'id_' + #id + '_' + #effectiveLocale"
    )
    public BrandObjectDto getBrandObjectById(long id, String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        boolean preferCny = displayLocaleResolver.prefersCny(effectiveLocale);
        BrandObjectEntity entity = brandObjectRepository.findById(id)
                .orElseThrow(BrandNotFoundException::new);
        return BrandObjectDto.from(entity, preferZh, preferCny);
    }

    @Cacheable(
            value = "brandObjects",
            key = "'search_' + #keyword + '_' + #effectiveLocale"
    )
    public List<BrandObjectDto> searchBrandObjects(String keyword, String effectiveLocale) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        boolean preferCny = displayLocaleResolver.prefersCny(effectiveLocale);

        List<BrandObjectEntity> entities;
        if (esEnabled()) {
            try {
                List<Long> ids = elasticsearchQueryService.searchIdsByKeyword(trimmed);
                Set<Long> unique = new LinkedHashSet<>(ids);
                entities = unique.stream()
                        .map(brandObjectRepository::findById)
                        .flatMap(java.util.Optional::stream)
                        .toList();
                if (entities.isEmpty()) {
                    entities = brandObjectRepository.searchByName(trimmed);
                }
            } catch (Exception e) {
                log.warn("Elasticsearch search failed, using SQL fallback: {}", e.getMessage());
                entities = brandObjectRepository.searchByName(trimmed);
            }
        } else {
            entities = brandObjectRepository.searchByName(trimmed);
        }
        return entities.stream()
                .map(e -> BrandObjectDto.from(e, preferZh, preferCny))
                .toList();
    }
}
