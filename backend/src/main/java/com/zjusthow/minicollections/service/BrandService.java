package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandDocument;
import com.zjusthow.minicollections.elasticsearch.BrandElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectDocument;
import com.zjusthow.minicollections.elasticsearch.BrandObjectElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectSearchRepository;
import com.zjusthow.minicollections.elasticsearch.BrandSearchRepository;
import com.zjusthow.minicollections.elasticsearch.EsFacetBucket;
import com.zjusthow.minicollections.elasticsearch.EsSearchFacetsResult;
import com.zjusthow.minicollections.elasticsearch.EsSearchPageResult;
import com.zjusthow.minicollections.model.BrandFacetDto;
import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
import com.zjusthow.minicollections.model.ScaleFacetDto;
import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import com.zjusthow.minicollections.exception.BrandObjectNotFoundException;
import com.zjusthow.minicollections.exception.CategoryNotFoundException;
import com.zjusthow.minicollections.exception.ScaleNotFoundException;
import com.zjusthow.minicollections.exception.SeriesNotFoundException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandBody;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.model.BrandObjectBody;
import com.zjusthow.minicollections.model.BrandObjectSearchFacetsDto;
import com.zjusthow.minicollections.model.CategoryFacetDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.repository.CategoryFacetRow;
import com.zjusthow.minicollections.repository.FacetCountRow;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;

@Service
public class BrandService {

    private static final Logger log = LoggerFactory.getLogger(BrandService.class);
    private static final int DEFAULT_SIZE = 24;
    private static final int MAX_SIZE = 48;

    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final SeriesRepository seriesRepository;
    private final CategoryRepository categoryRepository;
    private final ScaleRepository scaleRepository;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final BrandObjectElasticsearchQueryService brandObjectElasticsearchQueryService;
    private final BrandObjectSearchRepository brandObjectSearchRepository;
    private final BrandElasticsearchQueryService brandElasticsearchQueryService;
    private final BrandSearchRepository brandSearchRepository;
    private final ImageStorageService imageStorageService;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    public BrandService(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            SeriesRepository seriesRepository,
            CategoryRepository categoryRepository,
            ScaleRepository scaleRepository,
            DisplayLocaleResolver displayLocaleResolver,
            @Autowired(required = false) BrandObjectElasticsearchQueryService brandObjectElasticsearchQueryService,
            @Autowired(required = false) BrandObjectSearchRepository brandObjectSearchRepository,
            @Autowired(required = false) BrandElasticsearchQueryService brandElasticsearchQueryService,
            @Autowired(required = false) BrandSearchRepository brandSearchRepository,
            @Autowired(required = false) ImageStorageService imageStorageService) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.seriesRepository = seriesRepository;
        this.categoryRepository = categoryRepository;
        this.scaleRepository = scaleRepository;
        this.displayLocaleResolver = displayLocaleResolver;
        this.brandObjectElasticsearchQueryService = brandObjectElasticsearchQueryService;
        this.brandObjectSearchRepository = brandObjectSearchRepository;
        this.brandElasticsearchQueryService = brandElasticsearchQueryService;
        this.brandSearchRepository = brandSearchRepository;
        this.imageStorageService = imageStorageService;
    }

    private boolean esEnabled() {
        return elasticsearchEnabled && brandObjectElasticsearchQueryService != null;
    }

    private boolean brandEsEnabled() {
        return elasticsearchEnabled && brandElasticsearchQueryService != null;
    }

    public PageResponse<BrandDto> getBrandsPage(String effectiveLocale, int page, int size) {
        int pageSize = clampSize(size);
        int safePage = clampPage(page);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        long total = brandRepository.countAll();
        List<BrandEntity> entities = brandRepository.findPage(pageSize, offset(safePage, pageSize));
        List<BrandDto> content = entities.stream()
                .map(e -> BrandDto.from(e, preferZh))
                .toList();
        return PageResponse.of(content, safePage, pageSize, total, true);
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

    public PageResponse<BrandDto> searchBrandsPage(
            String keyword,
            String effectiveLocale,
            int page,
            int size) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return PageResponse.empty(clampPage(page), clampSize(size));
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        int pageSize = clampSize(size);
        int safePage = clampPage(page);

        if (brandEsEnabled()) {
            try {
                EsSearchPageResult esResult = brandElasticsearchQueryService.searchPage(
                        trimmed, safePage, pageSize);
                if (!esResult.ids().isEmpty() || safePage > 0) {
                    return fromEsBrandPage(esResult, preferZh, safePage, pageSize);
                }
            } catch (Exception e) {
                log.warn("Elasticsearch brand search failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandsSqlPage(trimmed, preferZh, safePage, pageSize);
    }

    public PageResponse<BrandObjectDto> getBrandObjectsPage(
            long brandId,
            String effectiveLocale,
            int page,
            int size) {
        int pageSize = clampSize(size);
        int safePage = clampPage(page);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        long total = brandObjectRepository.countByBrandId(brandId);
        List<BrandObjectEntity> entities = brandObjectRepository.findPageByBrandId(
                brandId, pageSize, offset(safePage, pageSize));
        List<BrandObjectDto> content = toBrandObjectDtos(entities, preferZh);
        return PageResponse.of(content, safePage, pageSize, total, true);
    }

    @Cacheable(
            value = "brandObjects",
            key = "'id_' + #id + '_' + #effectiveLocale"
    )
    public BrandObjectDto getBrandObjectById(long id, String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        BrandObjectEntity entity = brandObjectRepository.findById(id)
                .orElseThrow(BrandObjectNotFoundException::new);
        return toBrandObjectDto(entity, preferZh);
    }

    public PageResponse<BrandObjectDto> searchBrandObjectsPage(
            String keyword,
            String effectiveLocale,
            int page,
            int size) {
        return searchBrandObjectsPage(keyword, null, null, null, effectiveLocale, page, size);
    }

    public PageResponse<BrandObjectDto> searchBrandObjectsPage(
            String keyword,
            List<Long> categoryIds,
            List<Long> brandIds,
            List<Long> scaleIds,
            String effectiveLocale,
            int page,
            int size) {
        return searchBrandObjectsInternal(
                keyword,
                BrandObjectSearchFilter.global(categoryIds, brandIds, scaleIds),
                effectiveLocale,
                page,
                size);
    }

    public BrandObjectSearchFacetsDto searchBrandObjectsFacets(
            String keyword,
            String effectiveLocale) {
        return searchBrandObjectsFacetsInternal(keyword, null, effectiveLocale);
    }

    public PageResponse<BrandObjectDto> searchBrandObjectsByBrandIdPage(
            String keyword,
            long brandId,
            List<Long> categoryIds,
            List<Long> scaleIds,
            String effectiveLocale,
            int page,
            int size) {
        return searchBrandObjectsInternal(
                keyword,
                BrandObjectSearchFilter.withinBrand(brandId, categoryIds, scaleIds),
                effectiveLocale,
                page,
                size);
    }

    public BrandObjectSearchFacetsDto searchBrandObjectsByBrandIdFacets(
            String keyword,
            long brandId,
            String effectiveLocale) {
        return searchBrandObjectsFacetsInternal(keyword, brandId, effectiveLocale);
    }

    private BrandObjectSearchFacetsDto searchBrandObjectsFacetsInternal(
            String keyword,
            Long brandId,
            String effectiveLocale) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new BrandObjectSearchFacetsDto(0L, List.of(), List.of(), List.of());
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);

        if (esEnabled()) {
            try {
                EsSearchFacetsResult esResult =
                        brandObjectElasticsearchQueryService.searchFacets(trimmed, brandId);
                if (esResult.total() > 0) {
                    return toSearchFacetsDto(esResult, preferZh);
                }
            } catch (Exception e) {
                log.warn("Elasticsearch search facets failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandObjectsFacetsSql(trimmed, brandId, preferZh);
    }

    private BrandObjectSearchFacetsDto searchBrandObjectsFacetsSql(
            String keyword,
            Long brandId,
            boolean preferZh) {
        BrandObjectSearchFilter countFilter = brandId == null
                ? BrandObjectSearchFilter.global(null, null, null)
                : BrandObjectSearchFilter.withinBrand(brandId, null, null);
        long total = countSearch(keyword, countFilter);
        List<CategoryFacetRow> categoryRows = brandId == null
                ? brandObjectRepository.countByCategorySearch(keyword)
                : brandObjectRepository.countByCategoryWithinBrandSearch(keyword, brandId);
        List<CategoryFacetDto> categories = toCategoryFacetDtos(categoryRows, preferZh);
        List<BrandFacetDto> brands = brandId == null
                ? toBrandFacetDtos(brandObjectRepository.countByBrandSearch(keyword), preferZh)
                : List.of();
        List<ScaleFacetDto> scales = brandId == null
                ? toScaleFacetDtos(brandObjectRepository.countByScaleSearch(keyword))
                : toScaleFacetDtos(brandObjectRepository.countByScaleWithinBrandSearch(keyword, brandId));
        return new BrandObjectSearchFacetsDto(total, categories, brands, scales);
    }

    private BrandObjectSearchFacetsDto toSearchFacetsDto(
            EsSearchFacetsResult esResult,
            boolean preferZh) {
        return new BrandObjectSearchFacetsDto(
                esResult.total(),
                toCategoryFacetDtosFromBuckets(esResult.categories(), preferZh),
                toBrandFacetDtosFromBuckets(esResult.brands(), preferZh),
                toScaleFacetDtosFromBuckets(esResult.scales()));
    }

    private List<CategoryFacetDto> toCategoryFacetDtosFromBuckets(
            List<EsFacetBucket> buckets,
            boolean preferZh) {
        if (buckets.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (EsFacetBucket bucket : buckets) {
            ids.add(bucket.id());
        }
        Map<Long, CategoryEntity> byId = new HashMap<>();
        categoryRepository.findAllById(ids).forEach(c -> byId.put(c.id(), c));
        List<CategoryFacetDto> result = new ArrayList<>();
        for (EsFacetBucket bucket : buckets) {
            CategoryEntity entity = byId.get(bucket.id());
            if (entity != null) {
                result.add(CategoryFacetDto.from(entity, bucket.count(), preferZh));
            }
        }
        return result;
    }

    private List<BrandFacetDto> toBrandFacetDtosFromBuckets(
            List<EsFacetBucket> buckets,
            boolean preferZh) {
        if (buckets.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (EsFacetBucket bucket : buckets) {
            ids.add(bucket.id());
        }
        Map<Long, BrandEntity> byId = new HashMap<>();
        brandRepository.findAllById(ids).forEach(b -> byId.put(b.id(), b));
        List<BrandFacetDto> result = new ArrayList<>();
        for (EsFacetBucket bucket : buckets) {
            BrandEntity entity = byId.get(bucket.id());
            if (entity != null) {
                result.add(BrandFacetDto.from(entity, bucket.count(), preferZh));
            }
        }
        return result;
    }

    private List<BrandFacetDto> toBrandFacetDtos(List<FacetCountRow> rows, boolean preferZh) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (FacetCountRow row : rows) {
            ids.add(row.id());
        }
        Map<Long, BrandEntity> byId = new HashMap<>();
        brandRepository.findAllById(ids).forEach(b -> byId.put(b.id(), b));
        List<BrandFacetDto> result = new ArrayList<>();
        for (FacetCountRow row : rows) {
            BrandEntity entity = byId.get(row.id());
            if (entity != null && row.cnt() != null) {
                result.add(BrandFacetDto.from(entity, row.cnt(), preferZh));
            }
        }
        return result;
    }

    private List<ScaleFacetDto> toScaleFacetDtosFromBuckets(List<EsFacetBucket> buckets) {
        if (buckets.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (EsFacetBucket bucket : buckets) {
            ids.add(bucket.id());
        }
        Map<Long, ScaleEntity> byId = new HashMap<>();
        scaleRepository.findAllById(ids).forEach(s -> byId.put(s.id(), s));
        List<ScaleFacetDto> result = new ArrayList<>();
        for (EsFacetBucket bucket : buckets) {
            ScaleEntity entity = byId.get(bucket.id());
            if (entity != null) {
                result.add(ScaleFacetDto.from(entity, bucket.count()));
            }
        }
        return result;
    }

    private List<ScaleFacetDto> toScaleFacetDtos(List<FacetCountRow> rows) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (FacetCountRow row : rows) {
            ids.add(row.id());
        }
        Map<Long, ScaleEntity> byId = new HashMap<>();
        scaleRepository.findAllById(ids).forEach(s -> byId.put(s.id(), s));
        List<ScaleFacetDto> result = new ArrayList<>();
        for (FacetCountRow row : rows) {
            ScaleEntity entity = byId.get(row.id());
            if (entity != null && row.cnt() != null) {
                result.add(ScaleFacetDto.from(entity, row.cnt()));
            }
        }
        return result;
    }

    private long countSearch(String keyword, BrandObjectSearchFilter filter) {
        if (filter.scopeBrandId() != null) {
            return brandObjectRepository.countSearchWithinBrand(
                    keyword,
                    filter.scopeBrandId(),
                    filter.filterCategories(),
                    filter.categoryIdsParam(),
                    filter.filterScales(),
                    filter.scaleIdsParam());
        }
        return brandObjectRepository.countSearch(
                keyword,
                filter.filterBrands(),
                filter.brandIdsParam(),
                filter.filterCategories(),
                filter.categoryIdsParam(),
                filter.filterScales(),
                filter.scaleIdsParam());
    }

    private List<CategoryFacetDto> toCategoryFacetDtos(List<CategoryFacetRow> rows, boolean preferZh) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> categoryIds = new HashSet<>();
        for (CategoryFacetRow row : rows) {
            categoryIds.add(row.categoryId());
        }
        Map<Long, CategoryEntity> categoryById = new HashMap<>();
        categoryRepository.findAllById(categoryIds).forEach(c -> categoryById.put(c.id(), c));

        List<CategoryFacetDto> categories = new ArrayList<>();
        for (CategoryFacetRow row : rows) {
            CategoryEntity category = categoryById.get(row.categoryId());
            if (category != null && row.cnt() != null) {
                categories.add(CategoryFacetDto.from(category, row.cnt(), preferZh));
            }
        }
        return categories;
    }

    private PageResponse<BrandObjectDto> searchBrandObjectsInternal(
            String keyword,
            BrandObjectSearchFilter filter,
            String effectiveLocale,
            int page,
            int size) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return PageResponse.empty(clampPage(page), clampSize(size));
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        int pageSize = clampSize(size);
        int safePage = clampPage(page);

        if (esEnabled()) {
            try {
                EsSearchPageResult esResult = brandObjectElasticsearchQueryService.searchPage(
                        trimmed, filter, safePage, pageSize);
                if (!esResult.ids().isEmpty() || safePage > 0) {
                    return fromEsBrandObjectPage(esResult, preferZh, safePage, pageSize);
                }
            } catch (Exception e) {
                log.warn("Elasticsearch search failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandObjectsSqlPage(trimmed, filter, preferZh, safePage, pageSize);
    }

    private PageResponse<BrandDto> searchBrandsSqlPage(
            String keyword,
            boolean preferZh,
            int page,
            int pageSize) {
        long total = brandRepository.countSearch(keyword);
        List<BrandEntity> entities = brandRepository.searchPage(
                keyword, pageSize, offset(page, pageSize));
        List<BrandDto> content = entities.stream()
                .map(e -> BrandDto.from(e, preferZh))
                .toList();
        return PageResponse.of(content, page, pageSize, total, true);
    }

    private PageResponse<BrandObjectDto> searchBrandObjectsSqlPage(
            String keyword,
            BrandObjectSearchFilter filter,
            boolean preferZh,
            int page,
            int pageSize) {
        long total = countSearch(keyword, filter);
        List<BrandObjectEntity> entities;
        if (filter.scopeBrandId() != null) {
            entities = brandObjectRepository.searchPageWithinBrand(
                    keyword,
                    filter.scopeBrandId(),
                    filter.filterCategories(),
                    filter.categoryIdsParam(),
                    filter.filterScales(),
                    filter.scaleIdsParam(),
                    pageSize,
                    offset(page, pageSize));
        } else {
            entities = brandObjectRepository.searchPage(
                    keyword,
                    filter.filterBrands(),
                    filter.brandIdsParam(),
                    filter.filterCategories(),
                    filter.categoryIdsParam(),
                    filter.filterScales(),
                    filter.scaleIdsParam(),
                    pageSize,
                    offset(page, pageSize));
        }
        List<BrandObjectDto> content = toBrandObjectDtos(entities, preferZh);
        return PageResponse.of(content, page, pageSize, total, true);
    }

    private PageResponse<BrandDto> fromEsBrandPage(
            EsSearchPageResult esResult,
            boolean preferZh,
            int page,
            int pageSize) {
        List<BrandDto> content = loadByIdsInOrder(
                esResult.ids(),
                brandRepository::findAllById,
                e -> BrandDto.from(e, preferZh));
        return PageResponse.of(content, page, pageSize, esResult.totalElements(), esResult.totalExact());
    }

    private PageResponse<BrandObjectDto> fromEsBrandObjectPage(
            EsSearchPageResult esResult,
            boolean preferZh,
            int page,
            int pageSize) {
        List<BrandObjectDto> content = loadByIdsInOrder(
                esResult.ids(),
                brandObjectRepository::findAllById,
                e -> toBrandObjectDto(e, preferZh));
        return PageResponse.of(content, page, pageSize, esResult.totalElements(), esResult.totalExact());
    }

    private <T, E> List<T> loadByIdsInOrder(
            List<Long> ids,
            Function<Iterable<Long>, Iterable<E>> loader,
            Function<E, T> mapper) {
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, E> byId = new HashMap<>();
        loader.apply(ids).forEach(entity -> {
            if (entity instanceof BrandEntity brandEntity) {
                byId.put(brandEntity.id(), entity);
            } else if (entity instanceof BrandObjectEntity brandObjectEntity) {
                byId.put(brandObjectEntity.id(), entity);
            }
        });
        List<T> content = new ArrayList<>(ids.size());
        for (Long id : ids) {
            E entity = byId.get(id);
            if (entity != null) {
                content.add(mapper.apply(entity));
            }
        }
        return content;
    }

    private int clampPage(int page) {
        return Math.max(page, 0);
    }

    private int offset(int page, int pageSize) {
        return page * pageSize;
    }

    private int clampSize(int size) {
        if (size <= 0) {
            return DEFAULT_SIZE;
        }
        return Math.min(size, MAX_SIZE);
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

    @CacheEvict(value = {"brands", "brandObjects"}, allEntries = true)
    public BrandDto updateBrand(long id, BrandBody req, String effectiveLocale) {
        brandRepository.findById(id).orElseThrow(BrandNotFoundException::new);
        var updated = new com.zjusthow.minicollections.entity.BrandEntity(id, req.nameEn(), req.nameZh(), req.imageUrl());
        var saved = brandRepository.save(updated);
        if (brandEsEnabled()) {
            brandSearchRepository.save(BrandDocument.from(saved));
        }
        reindexBrandObjectsForBrand(saved);
        return BrandDto.from(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    @CacheEvict(value = "brands", allEntries = true)
    public BrandDto uploadBrandLogo(long id, MultipartFile file, String effectiveLocale) throws IOException {
        if (imageStorageService == null) {
            throw new IllegalStateException("Image storage is not configured");
        }
        BrandEntity brand = brandRepository.findById(id).orElseThrow(BrandNotFoundException::new);
        String imageUrl = imageStorageService.uploadBrandAsset(id, brand.nameEn(), file);
        var updated = new BrandEntity(id, brand.nameEn(), brand.nameZh(), imageUrl);
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
        validateSeriesForBrand(req.seriesId(), brandId);
        validateCategoryId(req.categoryId());
        validateScaleId(req.scaleId());
        BrandObjectEntity entity = new BrandObjectEntity(
                null, req.nameEn(), req.nameZh(), req.imageUrl(), req.imageSource(),
                req.releasePriceCny(), req.releasePriceUsd(), req.releaseDate(),
                brandId, req.seriesId(), req.categoryId(), req.scaleId()
        );
        BrandObjectEntity saved = brandObjectRepository.save(entity);
        indexBrandObject(saved);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return toBrandObjectDto(saved, preferZh);
    }

    @CacheEvict(value = "brandObjects", allEntries = true)
    public BrandObjectDto updateBrandObject(long id, BrandObjectBody req, String effectiveLocale) {
        BrandObjectEntity existing = brandObjectRepository.findById(id)
                .orElseThrow(BrandObjectNotFoundException::new);
        validateSeriesForBrand(req.seriesId(), existing.brandId());
        validateCategoryId(req.categoryId());
        validateScaleId(req.scaleId());
        BrandObjectEntity updated = new BrandObjectEntity(
                existing.id(), req.nameEn(), req.nameZh(),
                req.imageUrl(), req.imageSource(),
                req.releasePriceCny(), req.releasePriceUsd(), req.releaseDate(),
                existing.brandId(), req.seriesId(), req.categoryId(), req.scaleId()
        );
        BrandObjectEntity saved = brandObjectRepository.save(updated);
        indexBrandObject(saved);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return toBrandObjectDto(saved, preferZh);
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

    private BrandObjectDto toBrandObjectDto(BrandObjectEntity entity, boolean preferZh) {
        BrandEntity brand = brandRepository.findById(entity.brandId()).orElse(null);
        SeriesEntity series = entity.seriesId() != null
                ? seriesRepository.findById(entity.seriesId()).orElse(null)
                : null;
        CategoryEntity category = entity.categoryId() != null
                ? categoryRepository.findById(entity.categoryId()).orElse(null)
                : null;
        ScaleEntity scale = entity.scaleId() != null
                ? scaleRepository.findById(entity.scaleId()).orElse(null)
                : null;
        return BrandObjectDto.from(entity, brand, series, category, scale, preferZh);
    }

    private List<BrandObjectDto> toBrandObjectDtos(List<BrandObjectEntity> entities, boolean preferZh) {
        if (entities.isEmpty()) {
            return List.of();
        }
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
            brandRepository.findAllById(brandIds).forEach(b -> brandById.put(b.id(), b));
        }
        Map<Long, SeriesEntity> seriesById = new HashMap<>();
        if (!seriesIds.isEmpty()) {
            seriesRepository.findAllById(seriesIds).forEach(s -> seriesById.put(s.id(), s));
        }
        Map<Long, CategoryEntity> categoryById = new HashMap<>();
        if (!categoryIds.isEmpty()) {
            categoryRepository.findAllById(categoryIds).forEach(c -> categoryById.put(c.id(), c));
        }
        Map<Long, ScaleEntity> scaleById = new HashMap<>();
        if (!scaleIds.isEmpty()) {
            scaleRepository.findAllById(scaleIds).forEach(s -> scaleById.put(s.id(), s));
        }
        return entities.stream()
                .map(e -> BrandObjectDto.from(
                        e,
                        brandById.get(e.brandId()),
                        seriesById.get(e.seriesId()),
                        categoryById.get(e.categoryId()),
                        scaleById.get(e.scaleId()),
                        preferZh))
                .toList();
    }

    private void reindexBrandObjectsForBrand(BrandEntity brand) {
        if (!esEnabled()) {
            return;
        }
        brandObjectRepository.findByBrandId(brand.id())
                .orElse(List.of())
                .forEach(this::indexBrandObject);
    }

    private void validateSeriesForBrand(Long seriesId, Long brandId) {
        if (seriesId == null) {
            return;
        }
        SeriesEntity series = seriesRepository.findById(seriesId)
                .orElseThrow(SeriesNotFoundException::new);
        if (!Objects.equals(series.brandId(), brandId)) {
            throw new ValidationException("error.series_brand_mismatch");
        }
    }

    private void validateCategoryId(Long categoryId) {
        if (categoryId == null) {
            return;
        }
        if (!categoryRepository.existsById(categoryId)) {
            throw new CategoryNotFoundException();
        }
    }

    private void validateScaleId(Long scaleId) {
        if (scaleId == null) {
            return;
        }
        if (!scaleRepository.existsById(scaleId)) {
            throw new ScaleNotFoundException();
        }
    }

    private void indexBrandObject(BrandObjectEntity saved) {
        if (!esEnabled()) {
            return;
        }
        BrandEntity brand = brandRepository.findById(saved.brandId()).orElse(null);
        SeriesEntity series = saved.seriesId() != null
                ? seriesRepository.findById(saved.seriesId()).orElse(null)
                : null;
        CategoryEntity category = saved.categoryId() != null
                ? categoryRepository.findById(saved.categoryId()).orElse(null)
                : null;
        ScaleEntity scale = saved.scaleId() != null
                ? scaleRepository.findById(saved.scaleId()).orElse(null)
                : null;
        brandObjectSearchRepository.save(BrandObjectDocument.from(
                saved,
                brand != null ? brand.nameEn() : null,
                brand != null ? brand.nameZh() : null,
                series != null ? series.nameEn() : null,
                series != null ? series.nameZh() : null,
                category != null ? category.nameEn() : null,
                category != null ? category.nameZh() : null,
                scale != null ? scale.code() : null));
    }
}
