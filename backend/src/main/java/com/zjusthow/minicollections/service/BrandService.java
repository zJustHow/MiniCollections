package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandDocument;
import com.zjusthow.minicollections.elasticsearch.BrandElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectDocument;
import com.zjusthow.minicollections.elasticsearch.BrandObjectElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectSearchRepository;
import com.zjusthow.minicollections.elasticsearch.BrandSearchRepository;
import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import com.zjusthow.minicollections.exception.BrandObjectNotFoundException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandBody;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
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
    private final BrandObjectElasticsearchQueryService brandObjectElasticsearchQueryService;
    private final BrandObjectSearchRepository brandObjectSearchRepository;
    private final BrandElasticsearchQueryService brandElasticsearchQueryService;
    private final BrandSearchRepository brandSearchRepository;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    public BrandService(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            DisplayLocaleResolver displayLocaleResolver,
            @Autowired(required = false) BrandObjectElasticsearchQueryService brandObjectElasticsearchQueryService,
            @Autowired(required = false) BrandObjectSearchRepository brandObjectSearchRepository,
            @Autowired(required = false) BrandElasticsearchQueryService brandElasticsearchQueryService,
            @Autowired(required = false) BrandSearchRepository brandSearchRepository) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.displayLocaleResolver = displayLocaleResolver;
        this.brandObjectElasticsearchQueryService = brandObjectElasticsearchQueryService;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
        this.brandElasticsearchQueryService = brandElasticsearchQueryService;
        this.brandSearchRepository = brandSearchRepository;
    }

    private boolean esEnabled() {
        return elasticsearchEnabled && brandObjectElasticsearchQueryService != null;
    }

    private boolean brandEsEnabled() {
        return elasticsearchEnabled && brandElasticsearchQueryService != null;
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
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);

        if (brandEsEnabled()) {
            try {
                List<Long> ids = brandElasticsearchQueryService.searchIdsByKeyword(trimmed);
                if (!ids.isEmpty()) {
                    Set<Long> unique = new LinkedHashSet<>(ids);
                    return unique.stream()
                            .map(brandRepository::findById)
                            .flatMap(java.util.Optional::stream)
                            .map(e -> BrandDto.from(e, preferZh))
                            .toList();
                }
            } catch (Exception e) {
                log.warn("Elasticsearch brand search failed, using in-memory fallback: {}", e.getMessage());
            }
        }

        // fallback: in-memory filter
        String lowerCaseKeyword = trimmed.toLowerCase();
        return getBrands(effectiveLocale).stream()
                .filter(dto ->
                        dto.name().toLowerCase().contains(lowerCaseKeyword) ||
                        dto.nameEn().toLowerCase().contains(lowerCaseKeyword) ||
                        (dto.nameZh() != null && dto.nameZh().toLowerCase().contains(lowerCaseKeyword)))
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
                List<Long> ids = brandObjectElasticsearchQueryService.searchIdsByKeyword(trimmed);
                Set<Long> unique = new LinkedHashSet<>(ids);
                entities = unique.stream()
                        .map(brandObjectRepository::findById)
                        .flatMap(java.util.Optional::stream)
                        .toList();
                if (entities.isEmpty()) {
                    entities = brandObjectRepository.searchByNameOrBrandName(trimmed);
                }
            } catch (Exception e) {
                log.warn("Elasticsearch search failed, using SQL fallback: {}", e.getMessage());
                entities = brandObjectRepository.searchByNameOrBrandName(trimmed);
            }
        } else {
            entities = brandObjectRepository.searchByNameOrBrandName(trimmed);
        }
        return entities.stream()
                .map(e -> BrandObjectDto.from(e, preferZh, preferCny))
                .toList();
    }

    public List<BrandObjectDto> searchBrandObjectsByBrandId(String keyword, long brandId, String effectiveLocale) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        boolean preferCny = displayLocaleResolver.prefersCny(effectiveLocale);

        List<BrandObjectEntity> entities;
        if (esEnabled()) {
            try {
                List<Long> ids = brandObjectElasticsearchQueryService.searchIdsByKeywordAndBrandId(trimmed, brandId);
                Set<Long> unique = new LinkedHashSet<>(ids);
                entities = unique.stream()
                        .map(brandObjectRepository::findById)
                        .flatMap(java.util.Optional::stream)
                        .toList();
                if (entities.isEmpty()) {
                    entities = brandObjectRepository.searchByNameWithinBrand(trimmed, brandId);
                }
            } catch (Exception e) {
                log.warn("Elasticsearch brand-scoped search failed, using SQL fallback: {}", e.getMessage());
                entities = brandObjectRepository.searchByNameWithinBrand(trimmed, brandId);
            }
        } else {
            entities = brandObjectRepository.searchByNameWithinBrand(trimmed, brandId);
        }
        return entities.stream()
                .map(e -> BrandObjectDto.from(e, preferZh, preferCny))
                .toList();
    }

    @CacheEvict(value = "brands", allEntries = true)
    public BrandDto createBrand(BrandBody req, String effectiveLocale) {
        var entity = new com.zjusthow.minicollections.entity.BrandEntity(null, req.nameEn(), req.nameZh(), req.imageUrl());
        var saved = brandRepository.save(entity);
        if (brandEsEnabled()) {
            brandSearchRepository.save(BrandDocument.from(saved));
        }
        return BrandDto.from(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    @CacheEvict(value = "brands", allEntries = true)
    public BrandDto updateBrand(long id, BrandBody req, String effectiveLocale) {
        brandRepository.findById(id).orElseThrow(BrandNotFoundException::new);
        var updated = new com.zjusthow.minicollections.entity.BrandEntity(id, req.nameEn(), req.nameZh(), req.imageUrl());
        var saved = brandRepository.save(updated);
        if (brandEsEnabled()) {
            brandSearchRepository.save(BrandDocument.from(saved));
        }
        return BrandDto.from(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    @CacheEvict(value = {"brands", "brandObjects"}, allEntries = true)
    public void deleteBrand(long id) {
        if (!brandRepository.existsById(id)) {
            throw new BrandNotFoundException();
        }
        brandRepository.deleteById(id);
        if (brandEsEnabled()) {
            brandSearchRepository.deleteById(id);
        }
    }

    @CacheEvict(value = "brandObjects", allEntries = true)
    public BrandObjectDto createBrandObject(long brandId, BrandObjectBody req, String effectiveLocale) {
        BrandObjectEntity entity = new BrandObjectEntity(
                null, brandId, req.nameEn(), req.nameZh(), req.imageUrl(),
                req.releasePriceCny(), req.releasePriceUsd(), req.releaseDate(),
                req.categoryEn(), req.categoryZh(), req.scale()
        );
        BrandObjectEntity saved = brandObjectRepository.save(entity);
        if (esEnabled()) {
            BrandEntity brand = brandRepository.findById(brandId).orElse(null);
            brandObjectSearchRepository.save(BrandObjectDocument.from(
                    saved,
                    brand != null ? brand.nameEn() : null,
                    brand != null ? brand.nameZh() : null));
        }
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        boolean preferCny = displayLocaleResolver.prefersCny(effectiveLocale);
        return BrandObjectDto.from(saved, preferZh, preferCny);
    }

    @CacheEvict(value = "brandObjects", allEntries = true)
    public BrandObjectDto updateBrandObject(long id, BrandObjectBody req, String effectiveLocale) {
        BrandObjectEntity existing = brandObjectRepository.findById(id)
                .orElseThrow(BrandObjectNotFoundException::new);
        BrandObjectEntity updated = new BrandObjectEntity(
                existing.id(), existing.brandId(), req.nameEn(), req.nameZh(), req.imageUrl(),
                req.releasePriceCny(), req.releasePriceUsd(), req.releaseDate(),
                req.categoryEn(), req.categoryZh(), req.scale()
        );
        BrandObjectEntity saved = brandObjectRepository.save(updated);
        if (esEnabled()) {
            BrandEntity brand = brandRepository.findById(existing.brandId()).orElse(null);
            brandObjectSearchRepository.save(BrandObjectDocument.from(
                    saved,
                    brand != null ? brand.nameEn() : null,
                    brand != null ? brand.nameZh() : null));
        }
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        boolean preferCny = displayLocaleResolver.prefersCny(effectiveLocale);
        return BrandObjectDto.from(saved, preferZh, preferCny);
    }

    @CacheEvict(value = "brandObjects", allEntries = true)
    public void deleteBrandObject(long id) {
        if (!brandObjectRepository.existsById(id)) {
            throw new BrandObjectNotFoundException();
        }
        brandObjectRepository.deleteById(id);
        if (esEnabled()) {
            brandObjectSearchRepository.deleteById(id);
        }
    }
}
