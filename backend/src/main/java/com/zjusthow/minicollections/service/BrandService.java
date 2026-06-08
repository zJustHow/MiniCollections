package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandDocument;
import com.zjusthow.minicollections.elasticsearch.BrandElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import com.zjusthow.minicollections.elasticsearch.BrandSearchRepository;
import com.zjusthow.minicollections.elasticsearch.EsFacetBucket;
import com.zjusthow.minicollections.elasticsearch.EsSearchFacetsResult;
import com.zjusthow.minicollections.elasticsearch.EsSearchPageResult;
import com.zjusthow.minicollections.model.BrandFacetDto;
import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
import com.zjusthow.minicollections.model.ScaleFacetDto;
import com.zjusthow.minicollections.model.SeriesFacetDto;
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
import com.zjusthow.minicollections.model.BrandCombinedSearchDto;
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
import com.zjusthow.minicollections.repository.UserObjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private static final int DEFAULT_SIZE = 48;
    private static final int MAX_SIZE = 48;

    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final SeriesRepository seriesRepository;
    private final CategoryRepository categoryRepository;
    private final ScaleRepository scaleRepository;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final BrandObjectElasticsearchQueryService brandObjectElasticsearchQueryService;
    private final BrandObjectIndexService brandObjectIndexService;
    private final BrandElasticsearchQueryService brandElasticsearchQueryService;
    private final BrandSearchRepository brandSearchRepository;
    private final ImageStorageService imageStorageService;
    private final UserObjectRepository userObjectRepository;
    private final ViewCountService viewCountService;

    @Value("${app.elasticsearch.enabled:true}")
    private boolean elasticsearchEnabled;

    @Autowired
    @Lazy
    private BrandService self;

    public BrandService(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository,
            SeriesRepository seriesRepository,
            CategoryRepository categoryRepository,
            ScaleRepository scaleRepository,
            DisplayLocaleResolver displayLocaleResolver,
            @Autowired(required = false) BrandObjectElasticsearchQueryService brandObjectElasticsearchQueryService,
            @Autowired(required = false) BrandObjectIndexService brandObjectIndexService,
            @Autowired(required = false) BrandElasticsearchQueryService brandElasticsearchQueryService,
            @Autowired(required = false) BrandSearchRepository brandSearchRepository,
            @Autowired(required = false) ImageStorageService imageStorageService,
            UserObjectRepository userObjectRepository,
            ViewCountService viewCountService) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.seriesRepository = seriesRepository;
        this.categoryRepository = categoryRepository;
        this.scaleRepository = scaleRepository;
        this.displayLocaleResolver = displayLocaleResolver;
        this.brandObjectElasticsearchQueryService = brandObjectElasticsearchQueryService;
        this.brandObjectIndexService = brandObjectIndexService;
        this.brandElasticsearchQueryService = brandElasticsearchQueryService;
        this.brandSearchRepository = brandSearchRepository;
        this.imageStorageService = imageStorageService;
        this.userObjectRepository = userObjectRepository;
        this.viewCountService = viewCountService;
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
                .map(e -> toBrandDto(e, preferZh))
                .toList();
        return PageResponse.of(content, safePage, pageSize, total, true);
    }

    public BrandDto getBrandById(long id, String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        BrandDto cached = self.getBrandByIdCached(id, preferZh);
        return cached.withViewCount(viewCountService.displayBrandViewCount(id, cached.viewCount()));
    }

    @Cacheable(value = "brands", key = "'id_' + #id + '_' + #preferZh")
    public BrandDto getBrandByIdCached(long id, boolean preferZh) {
        return brandRepository.findById(id)
                .map(entity -> BrandDto.from(entity, preferZh))
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
                return fromEsBrandPage(esResult, preferZh, safePage, pageSize);
            } catch (Exception e) {
                log.warn("Elasticsearch brand search failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandsSqlPage(trimmed, preferZh, safePage, pageSize);
    }

    public BrandCombinedSearchDto searchCombinedPage(
            String keyword,
            List<Long> categoryIds,
            List<Long> brandIds,
            List<Long> scaleIds,
            List<Long> seriesIds,
            String effectiveLocale,
            int page,
            int size) {
        int pageSize = clampSize(size);
        int safePage = clampPage(page);
        if (keyword == null || keyword.trim().isEmpty()) {
            return BrandCombinedSearchDto.empty(safePage, pageSize);
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        BrandObjectSearchFilter filter =
                BrandObjectSearchFilter.global(categoryIds, brandIds, scaleIds, seriesIds);

        BrandSearchTotals brandTotals = resolveBrandSearchTotals(trimmed);
        ObjectSearchTotals objectTotals = resolveObjectSearchTotals(trimmed, filter);
        long totalBrands = brandTotals.total();
        long totalObjects = objectTotals.total();
        long totalElements = totalBrands + totalObjects;
        boolean totalExact = brandTotals.totalExact() && objectTotals.totalExact();
        int totalPages = pageSize <= 0 ? 0 : (int) Math.ceil((double) totalElements / pageSize);

        long globalStart = (long) safePage * pageSize;
        List<BrandDto> brands = List.of();
        List<BrandObjectDto> objects = List.of();
        int remaining = pageSize;

        if (globalStart < totalBrands && remaining > 0) {
            int brandOffset = (int) globalStart;
            int brandLimit = (int) Math.min(remaining, totalBrands - globalStart);
            brands = fetchBrandSearchSlice(trimmed, preferZh, brandOffset, brandLimit);
            remaining -= brands.size();
        }

        if (remaining > 0) {
            int objectOffset = (int) Math.max(0L, globalStart - totalBrands);
            objects = fetchBrandObjectSearchSlice(trimmed, filter, preferZh, objectOffset, remaining);
        }

        return new BrandCombinedSearchDto(
                brands,
                objects,
                safePage,
                pageSize,
                totalBrands,
                totalObjects,
                totalElements,
                totalPages,
                totalExact);
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

    public BrandObjectDto getBrandObjectById(long id, String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        BrandObjectDto cached = self.getBrandObjectByIdCached(id, preferZh);
        return cached.withViewCount(viewCountService.displayModelViewCount(id, cached.viewCount()));
    }

    @Cacheable(value = "brandObjects", key = "'id_' + #id + '_' + #preferZh")
    public BrandObjectDto getBrandObjectByIdCached(long id, boolean preferZh) {
        BrandObjectEntity entity = brandObjectRepository.findById(id)
                .orElseThrow(BrandObjectNotFoundException::new);
        return toBrandObjectDtoWithStoredViewCount(entity, preferZh);
    }

    public PageResponse<BrandObjectDto> searchBrandObjectsPage(
            String keyword,
            String effectiveLocale,
            int page,
            int size) {
        return searchBrandObjectsPage(keyword, null, null, null, null, effectiveLocale, page, size);
    }

    public PageResponse<BrandObjectDto> searchBrandObjectsPage(
            String keyword,
            List<Long> categoryIds,
            List<Long> brandIds,
            List<Long> scaleIds,
            List<Long> seriesIds,
            String effectiveLocale,
            int page,
            int size) {
        return searchBrandObjectsInternal(
                keyword,
                BrandObjectSearchFilter.global(categoryIds, brandIds, scaleIds, seriesIds),
                effectiveLocale,
                page,
                size);
    }

    public BrandObjectSearchFacetsDto searchBrandObjectsFacets(
            String keyword,
            List<Long> categoryIds,
            List<Long> brandIds,
            List<Long> scaleIds,
            List<Long> seriesIds,
            String effectiveLocale) {
        return searchBrandObjectsFacetsInternal(
                keyword,
                null,
                BrandObjectSearchFilter.global(categoryIds, brandIds, scaleIds, seriesIds),
                effectiveLocale);
    }

    public PageResponse<BrandObjectDto> searchBrandObjectsByBrandIdPage(
            String keyword,
            long brandId,
            List<Long> categoryIds,
            List<Long> scaleIds,
            List<Long> seriesIds,
            String effectiveLocale,
            int page,
            int size) {
        return searchBrandObjectsInternal(
                keyword,
                BrandObjectSearchFilter.withinBrand(brandId, categoryIds, scaleIds, seriesIds),
                effectiveLocale,
                page,
                size);
    }

    public BrandObjectSearchFacetsDto searchBrandObjectsByBrandIdFacets(
            String keyword,
            long brandId,
            List<Long> categoryIds,
            List<Long> scaleIds,
            List<Long> seriesIds,
            String effectiveLocale) {
        BrandObjectSearchFilter filter =
                BrandObjectSearchFilter.withinBrand(brandId, categoryIds, scaleIds, seriesIds);
        return searchBrandObjectsFacetsInternal(keyword, brandId, filter, effectiveLocale);
    }

    private BrandObjectSearchFacetsDto searchBrandObjectsFacetsInternal(
            String keyword,
            Long brandId,
            BrandObjectSearchFilter appliedFilter,
            String effectiveLocale) {
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        if (!hasKeyword) {
            return new BrandObjectSearchFacetsDto(0L, List.of(), List.of(), List.of(), List.of());
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        BrandObjectSearchFilter filter = appliedFilter != null
                ? appliedFilter
                : (brandId == null
                        ? BrandObjectSearchFilter.global(null, null, null, null)
                        : BrandObjectSearchFilter.withinBrand(brandId, null, null, null));

        if (esEnabled()) {
            try {
                EsSearchFacetsResult esResult =
                        brandObjectElasticsearchQueryService.searchFacets(trimmed, filter);
                return toSearchFacetsDto(esResult, preferZh);
            } catch (Exception e) {
                log.warn("Elasticsearch search facets failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandObjectsFacetsSql(trimmed, true, brandId, preferZh, filter);
    }

    private BrandObjectSearchFacetsDto searchBrandObjectsFacetsSql(
            String keyword,
            boolean hasKeyword,
            Long brandId,
            boolean preferZh,
            BrandObjectSearchFilter filter) {
        long total = countSearch(keyword, filter);
        if (brandId != null) {
            BrandObjectSearchFilter categoryCtx = filter.forCategoryFacetBuckets();
            BrandObjectSearchFilter scaleCtx = filter.forScaleFacetBuckets();
            BrandObjectSearchFilter seriesCtx = filter.forSeriesFacetBuckets();
            List<CategoryFacetDto> categories = toCategoryFacetDtos(
                    brandObjectRepository.countByCategoryWithinBrandSearch(
                            keyword,
                            hasKeyword,
                            brandId,
                            categoryCtx.filterCategories(),
                            categoryCtx.categoryIdsParam(),
                            categoryCtx.filterScales(),
                            categoryCtx.scaleIdsParam(),
                            categoryCtx.filterSeries(),
                            categoryCtx.seriesIdsParam()),
                    preferZh);
            List<ScaleFacetDto> scales = toScaleFacetDtos(
                    brandObjectRepository.countByScaleWithinBrandSearch(
                            keyword,
                            hasKeyword,
                            brandId,
                            scaleCtx.filterCategories(),
                            scaleCtx.categoryIdsParam(),
                            scaleCtx.filterScales(),
                            scaleCtx.scaleIdsParam(),
                            scaleCtx.filterSeries(),
                            scaleCtx.seriesIdsParam()));
            List<SeriesFacetDto> series = toSeriesFacetDtos(
                    brandObjectRepository.countBySeriesWithinBrandSearch(
                            keyword,
                            hasKeyword,
                            brandId,
                            seriesCtx.filterCategories(),
                            seriesCtx.categoryIdsParam(),
                            seriesCtx.filterScales(),
                            seriesCtx.scaleIdsParam(),
                            seriesCtx.filterSeries(),
                            seriesCtx.seriesIdsParam()),
                    preferZh);
            return new BrandObjectSearchFacetsDto(total, categories, List.of(), scales, series);
        }
        BrandObjectSearchFilter categoryCtx = filter.forCategoryFacetBuckets();
        BrandObjectSearchFilter brandCtx = filter.forBrandFacetBuckets();
        BrandObjectSearchFilter scaleCtx = filter.forScaleFacetBuckets();
        BrandObjectSearchFilter seriesCtx = filter.forSeriesFacetBuckets();
        List<CategoryFacetDto> categories = toCategoryFacetDtos(
                brandObjectRepository.countByCategorySearch(
                        keyword,
                        categoryCtx.filterBrands(),
                        categoryCtx.brandIdsParam(),
                        categoryCtx.filterCategories(),
                        categoryCtx.categoryIdsParam(),
                        categoryCtx.filterScales(),
                        categoryCtx.scaleIdsParam(),
                        categoryCtx.filterSeries(),
                        categoryCtx.seriesIdsParam()),
                preferZh);
        List<BrandFacetDto> brands = toBrandFacetDtos(
                brandObjectRepository.countByBrandSearch(
                        keyword,
                        brandCtx.filterBrands(),
                        brandCtx.brandIdsParam(),
                        brandCtx.filterCategories(),
                        brandCtx.categoryIdsParam(),
                        brandCtx.filterScales(),
                        brandCtx.scaleIdsParam(),
                        brandCtx.filterSeries(),
                        brandCtx.seriesIdsParam()),
                preferZh);
        List<ScaleFacetDto> scales = toScaleFacetDtos(
                brandObjectRepository.countByScaleSearch(
                        keyword,
                        scaleCtx.filterBrands(),
                        scaleCtx.brandIdsParam(),
                        scaleCtx.filterCategories(),
                        scaleCtx.categoryIdsParam(),
                        scaleCtx.filterScales(),
                        scaleCtx.scaleIdsParam(),
                        scaleCtx.filterSeries(),
                        scaleCtx.seriesIdsParam()));
        List<SeriesFacetDto> series = toSeriesFacetDtos(
                brandObjectRepository.countBySeriesSearch(
                        keyword,
                        seriesCtx.filterBrands(),
                        seriesCtx.brandIdsParam(),
                        seriesCtx.filterCategories(),
                        seriesCtx.categoryIdsParam(),
                        seriesCtx.filterScales(),
                        seriesCtx.scaleIdsParam(),
                        seriesCtx.filterSeries(),
                        seriesCtx.seriesIdsParam()),
                preferZh);
        return new BrandObjectSearchFacetsDto(total, categories, brands, scales, series);
    }

    private BrandObjectSearchFacetsDto toSearchFacetsDto(
            EsSearchFacetsResult esResult,
            boolean preferZh) {
        return new BrandObjectSearchFacetsDto(
                esResult.total(),
                toCategoryFacetDtosFromBuckets(esResult.categories(), preferZh),
                toBrandFacetDtosFromBuckets(esResult.brands(), preferZh),
                toScaleFacetDtosFromBuckets(esResult.scales()),
                toSeriesFacetDtosFromBuckets(esResult.series(), preferZh));
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

    private List<SeriesFacetDto> toSeriesFacetDtosFromBuckets(
            List<EsFacetBucket> buckets,
            boolean preferZh) {
        if (buckets.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (EsFacetBucket bucket : buckets) {
            ids.add(bucket.id());
        }
        Map<Long, SeriesEntity> byId = new HashMap<>();
        seriesRepository.findAllById(ids).forEach(s -> byId.put(s.id(), s));
        List<SeriesFacetDto> result = new ArrayList<>();
        for (EsFacetBucket bucket : buckets) {
            SeriesEntity entity = byId.get(bucket.id());
            if (entity != null) {
                result.add(SeriesFacetDto.from(entity, bucket.count(), preferZh));
            }
        }
        return result;
    }

    private List<SeriesFacetDto> toSeriesFacetDtos(List<FacetCountRow> rows, boolean preferZh) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (FacetCountRow row : rows) {
            ids.add(row.id());
        }
        Map<Long, SeriesEntity> byId = new HashMap<>();
        seriesRepository.findAllById(ids).forEach(s -> byId.put(s.id(), s));
        List<SeriesFacetDto> result = new ArrayList<>();
        for (FacetCountRow row : rows) {
            SeriesEntity entity = byId.get(row.id());
            if (entity != null && row.cnt() != null) {
                result.add(SeriesFacetDto.from(entity, row.cnt(), preferZh));
            }
        }
        return result;
    }

    private long countSearch(String keyword, BrandObjectSearchFilter filter) {
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        String trimmed = hasKeyword ? keyword.trim() : "";
        if (filter.scopeBrandId() != null) {
            return brandObjectRepository.countSearchWithinBrand(
                    trimmed,
                    hasKeyword,
                    filter.scopeBrandId(),
                    filter.filterCategories(),
                    filter.categoryIdsParam(),
                    filter.filterScales(),
                    filter.scaleIdsParam(),
                    filter.filterSeries(),
                    filter.seriesIdsParam());
        }
        return brandObjectRepository.countSearch(
                trimmed,
                filter.filterBrands(),
                filter.brandIdsParam(),
                filter.filterCategories(),
                filter.categoryIdsParam(),
                filter.filterScales(),
                filter.scaleIdsParam(),
                filter.filterSeries(),
                filter.seriesIdsParam());
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
                return fromEsBrandObjectPage(esResult, filter, preferZh, safePage, pageSize);
            } catch (Exception e) {
                log.warn("Elasticsearch search failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandObjectsSqlPage(trimmed, true, filter, preferZh, safePage, pageSize);
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
                .map(e -> toBrandDto(e, preferZh))
                .toList();
        return PageResponse.of(content, page, pageSize, total, true);
    }

    private PageResponse<BrandObjectDto> searchBrandObjectsSqlPage(
            String keyword,
            boolean hasKeyword,
            BrandObjectSearchFilter filter,
            boolean preferZh,
            int page,
            int pageSize) {
        long total = countSearch(keyword, filter);
        List<BrandObjectEntity> entities;
        if (filter.scopeBrandId() != null) {
            entities = brandObjectRepository.searchPageWithinBrand(
                    keyword,
                    hasKeyword,
                    filter.scopeBrandId(),
                    filter.filterCategories(),
                    filter.categoryIdsParam(),
                    filter.filterScales(),
                    filter.scaleIdsParam(),
                    filter.filterSeries(),
                    filter.seriesIdsParam(),
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
                    filter.filterSeries(),
                    filter.seriesIdsParam(),
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
                e -> toBrandDto(e, preferZh));
        return PageResponse.of(content, page, pageSize, esResult.totalElements(), esResult.totalExact());
    }

    private PageResponse<BrandObjectDto> fromEsBrandObjectPage(
            EsSearchPageResult esResult,
            BrandObjectSearchFilter filter,
            boolean preferZh,
            int page,
            int pageSize) {
        List<BrandObjectDto> content = loadBrandObjectsByIdsInOrder(esResult.ids(), filter, preferZh);
        return PageResponse.of(content, page, pageSize, esResult.totalElements(), esResult.totalExact());
    }

    private record BrandSearchTotals(long total, boolean totalExact) {}

    private record ObjectSearchTotals(long total, boolean totalExact) {}

    private BrandSearchTotals resolveBrandSearchTotals(String keyword) {
        if (brandEsEnabled()) {
            try {
                EsSearchPageResult esResult = brandElasticsearchQueryService.searchPage(keyword, 0, 1);
                return new BrandSearchTotals(esResult.totalElements(), esResult.totalExact());
            } catch (Exception e) {
                log.warn("Elasticsearch brand count failed, using SQL fallback: {}", e.getMessage());
            }
        }
        return new BrandSearchTotals(brandRepository.countSearch(keyword), true);
    }

    private ObjectSearchTotals resolveObjectSearchTotals(String keyword, BrandObjectSearchFilter filter) {
        if (esEnabled()) {
            try {
                EsSearchPageResult esResult =
                        brandObjectElasticsearchQueryService.searchPage(keyword, filter, 0, 1);
                return new ObjectSearchTotals(esResult.totalElements(), esResult.totalExact());
            } catch (Exception e) {
                log.warn("Elasticsearch object count failed, using SQL fallback: {}", e.getMessage());
            }
        }
        return new ObjectSearchTotals(countSearch(keyword, filter), true);
    }

    private List<BrandDto> fetchBrandSearchSlice(
            String keyword,
            boolean preferZh,
            int offset,
            int limit) {
        if (limit <= 0) {
            return List.of();
        }
        if (brandEsEnabled()) {
            try {
                EsSearchPageResult esResult =
                        brandElasticsearchQueryService.searchSlice(keyword, offset, limit);
                return loadByIdsInOrder(
                        esResult.ids(),
                        brandRepository::findAllById,
                        e -> toBrandDto(e, preferZh));
            } catch (Exception e) {
                log.warn("Elasticsearch brand slice failed, using SQL fallback: {}", e.getMessage());
            }
        }
        return brandRepository.searchPage(keyword, limit, offset).stream()
                .map(e -> toBrandDto(e, preferZh))
                .toList();
    }

    private List<BrandObjectDto> fetchBrandObjectSearchSlice(
            String keyword,
            BrandObjectSearchFilter filter,
            boolean preferZh,
            int offset,
            int limit) {
        if (limit <= 0) {
            return List.of();
        }
        if (esEnabled()) {
            try {
                EsSearchPageResult esResult =
                        brandObjectElasticsearchQueryService.searchSlice(keyword, filter, offset, limit);
                return loadBrandObjectsByIdsInOrder(esResult.ids(), filter, preferZh);
            } catch (Exception e) {
                log.warn("Elasticsearch object slice failed, using SQL fallback: {}", e.getMessage());
            }
        }
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        String trimmed = hasKeyword ? keyword.trim() : "";
        List<BrandObjectEntity> entities;
        if (filter.scopeBrandId() != null) {
            entities = brandObjectRepository.searchPageWithinBrand(
                    trimmed,
                    hasKeyword,
                    filter.scopeBrandId(),
                    filter.filterCategories(),
                    filter.categoryIdsParam(),
                    filter.filterScales(),
                    filter.scaleIdsParam(),
                    filter.filterSeries(),
                    filter.seriesIdsParam(),
                    limit,
                    offset);
        } else {
            entities = brandObjectRepository.searchPage(
                    trimmed,
                    filter.filterBrands(),
                    filter.brandIdsParam(),
                    filter.filterCategories(),
                    filter.categoryIdsParam(),
                    filter.filterScales(),
                    filter.scaleIdsParam(),
                    filter.filterSeries(),
                    filter.seriesIdsParam(),
                    limit,
                    offset);
        }
        return toBrandObjectDtos(entities, preferZh);
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

    private List<BrandObjectDto> loadBrandObjectsByIdsInOrder(
            List<Long> ids,
            BrandObjectSearchFilter filter,
            boolean preferZh) {
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, BrandObjectEntity> byId = new HashMap<>();
        brandObjectRepository.findAllById(ids).forEach(entity -> byId.put(entity.id(), entity));
        List<BrandObjectDto> content = new ArrayList<>(ids.size());
        for (Long id : ids) {
            BrandObjectEntity entity = byId.get(id);
            if (entity != null && entityMatchesFilter(entity, filter)) {
                content.add(toBrandObjectDto(entity, preferZh));
            }
        }
        return content;
    }

    private static boolean entityMatchesFilter(
            BrandObjectEntity entity,
            BrandObjectSearchFilter filter) {
        if (filter.scopeBrandId() != null && !filter.scopeBrandId().equals(entity.brandId())) {
            return false;
        }
        if (filter.filterBrands()
                && (entity.brandId() == null || !filter.brandIds().contains(entity.brandId()))) {
            return false;
        }
        if (filter.filterCategories()
                && (entity.categoryId() == null || !filter.categoryIds().contains(entity.categoryId()))) {
            return false;
        }
        if (filter.filterScales()
                && (entity.scaleId() == null || !filter.scaleIds().contains(entity.scaleId()))) {
            return false;
        }
        if (filter.filterSeries()
                && (entity.seriesId() == null || !filter.seriesIds().contains(entity.seriesId()))) {
            return false;
        }
        return true;
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

    public BrandDto createBrand(BrandBody req, String effectiveLocale) {
        var entity = new com.zjusthow.minicollections.entity.BrandEntity(
                null, req.nameEn(), req.nameZh(), req.abbreviation(), req.imageUrl(), 0L);
        var saved = brandRepository.save(entity);
        if (brandEsEnabled()) {
            brandSearchRepository.save(BrandDocument.from(saved));
        }
        return toBrandDto(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    @Caching(evict = {
            @CacheEvict(value = "brands", key = "'id_' + #id + '_true'"),
            @CacheEvict(value = "brands", key = "'id_' + #id + '_false'"),
            @CacheEvict(value = "brandObjects", allEntries = true)
    })
    public BrandDto updateBrand(long id, BrandBody req, String effectiveLocale) {
        BrandEntity existing = brandRepository.findById(id).orElseThrow(BrandNotFoundException::new);
        deleteReplacedStoredImage(existing.imageUrl(), req.imageUrl());
        var updated = new com.zjusthow.minicollections.entity.BrandEntity(
                id, req.nameEn(), req.nameZh(), req.abbreviation(), req.imageUrl(), existing.viewCount());
        var saved = brandRepository.save(updated);
        if (brandEsEnabled()) {
            brandSearchRepository.save(BrandDocument.from(saved));
        }
        reindexBrandObjectsForBrand(saved);
        return toBrandDto(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    /** Admin upload stores the file as-is (no {@link com.zjusthow.minicollections.image.BrandLogoNormalizer}). */
    @Caching(evict = {
            @CacheEvict(value = "brands", key = "'id_' + #id + '_true'"),
            @CacheEvict(value = "brands", key = "'id_' + #id + '_false'")
    })
    public BrandDto uploadBrandLogo(long id, MultipartFile file, String effectiveLocale) throws IOException {
        if (imageStorageService == null) {
            throw new IllegalStateException("Image storage is not configured");
        }
        BrandEntity brand = brandRepository.findById(id).orElseThrow(BrandNotFoundException::new);
        String imageUrl = imageStorageService.uploadBrandAsset(id, brand.nameEn(), file);
        var updated = new BrandEntity(
                id, brand.nameEn(), brand.nameZh(), brand.abbreviation(), imageUrl, brand.viewCount());
        var saved = brandRepository.save(updated);
        if (brandEsEnabled()) {
            brandSearchRepository.save(BrandDocument.from(saved));
        }
        return toBrandDto(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    @CacheEvict(value = {"brands", "brandObjects"}, allEntries = true)
    @Transactional
    public void deleteBrand(long id) {
        BrandEntity brand = brandRepository.findById(id)
                .orElseThrow(BrandNotFoundException::new);
        brandObjectRepository.findByBrandId(id)
                .orElse(Collections.emptyList())
                .forEach(this::removeBrandObject);
        brandRepository.deleteById(id);
        if (brandEsEnabled()) {
            brandSearchRepository.deleteById(id);
        }
        deleteStoredImage(brand.imageUrl());
    }

    public BrandObjectDto createBrandObject(long brandId, BrandObjectBody req, String effectiveLocale) {
        validateSeriesForBrand(req.seriesId(), brandId);
        validateCategoryId(req.categoryId());
        validateScaleId(req.scaleId());
        BrandObjectEntity entity = new BrandObjectEntity(
                null, req.nameEn(), req.nameZh(), req.imageUrl(), req.imageSource(),
                req.releasePriceCny(), req.releasePriceUsd(), req.releaseDate(),
                brandId, req.seriesId(), req.categoryId(), req.scaleId(), 0L
        );
        BrandObjectEntity saved = brandObjectRepository.save(entity);
        indexBrandObject(saved);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return toBrandObjectDto(saved, preferZh);
    }

    @Caching(evict = {
            @CacheEvict(value = "brandObjects", key = "'id_' + #id + '_true'"),
            @CacheEvict(value = "brandObjects", key = "'id_' + #id + '_false'")
    })
    public BrandObjectDto updateBrandObject(long id, BrandObjectBody req, String effectiveLocale) {
        BrandObjectEntity existing = brandObjectRepository.findById(id)
                .orElseThrow(BrandObjectNotFoundException::new);
        validateSeriesForBrand(req.seriesId(), existing.brandId());
        validateCategoryId(req.categoryId());
        validateScaleId(req.scaleId());
        deleteReplacedStoredImage(existing.imageUrl(), req.imageUrl());
        BrandObjectEntity updated = new BrandObjectEntity(
                existing.id(), req.nameEn(), req.nameZh(),
                req.imageUrl(), req.imageSource(),
                req.releasePriceCny(), req.releasePriceUsd(), req.releaseDate(),
                existing.brandId(), req.seriesId(), req.categoryId(), req.scaleId(),
                existing.viewCount()
        );
        BrandObjectEntity saved = brandObjectRepository.save(updated);
        indexBrandObject(saved);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return toBrandObjectDto(saved, preferZh);
    }

    @Caching(evict = {
            @CacheEvict(value = "brandObjects", key = "'id_' + #id + '_true'"),
            @CacheEvict(value = "brandObjects", key = "'id_' + #id + '_false'")
    })
    @Transactional
    public void deleteBrandObject(long id) {
        BrandObjectEntity existing = brandObjectRepository.findById(id)
                .orElseThrow(BrandObjectNotFoundException::new);
        removeBrandObject(existing);
    }

    private void removeBrandObject(BrandObjectEntity existing) {
        userObjectRepository.clearBrandObjectReference(existing.id());
        String imageUrl = existing.imageUrl();
        brandObjectRepository.deleteById(existing.id());
        if (esEnabled()) {
            brandObjectIndexService.delete(existing.id());
        }
        deleteStoredImage(imageUrl);
    }

    private void deleteStoredImage(String imageUrl) {
        if (imageStorageService != null) {
            imageStorageService.deleteStoredImageIfInBucket(imageUrl);
        }
    }

    private void deleteReplacedStoredImage(String previousUrl, String newUrl) {
        if (imageStorageService != null) {
            imageStorageService.deleteReplacedStoredImage(previousUrl, newUrl);
        }
    }

    private BrandObjectDto toBrandObjectDto(BrandObjectEntity entity, boolean preferZh) {
        return toBrandObjectDtoWithViewCount(
                entity,
                preferZh,
                viewCountService.displayModelViewCount(entity.id(), entity.viewCount()));
    }

    private BrandObjectDto toBrandObjectDtoWithStoredViewCount(BrandObjectEntity entity, boolean preferZh) {
        return toBrandObjectDtoWithViewCount(entity, preferZh, entity.viewCount());
    }

    private BrandObjectDto toBrandObjectDtoWithViewCount(
            BrandObjectEntity entity,
            boolean preferZh,
            long viewCount) {
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
        return BrandObjectDto.from(
                entity, brand, series, category, scale, preferZh, viewCount);
    }

    private BrandDto toBrandDto(BrandEntity entity, boolean preferZh) {
        return BrandDto.from(
                entity,
                preferZh,
                viewCountService.displayBrandViewCount(entity.id(), entity.viewCount()));
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
        brandObjectIndexService.reindexForBrand(brand.id());
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
        brandObjectIndexService.index(saved);
    }
}
