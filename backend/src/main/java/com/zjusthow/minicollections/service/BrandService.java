package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandDocument;
import com.zjusthow.minicollections.elasticsearch.BrandElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectDocument;
import com.zjusthow.minicollections.elasticsearch.BrandObjectElasticsearchQueryService;
import com.zjusthow.minicollections.elasticsearch.BrandObjectSearchRepository;
import com.zjusthow.minicollections.elasticsearch.BrandSearchRepository;
import com.zjusthow.minicollections.elasticsearch.EsSearchSliceResult;
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
import com.zjusthow.minicollections.model.SliceResponse;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import com.zjusthow.minicollections.util.CursorCodec;
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

    public SliceResponse<BrandDto> getBrandsSlice(String effectiveLocale, int size, String cursor) {
        int pageSize = clampSize(size);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        Long afterId = CursorCodec.decodeSql(cursor);

        List<BrandEntity> entities = afterId == null
                ? brandRepository.findFirstPage(pageSize)
                : brandRepository.findAfterId(afterId, pageSize);

        List<BrandDto> content = entities.stream()
                .map(e -> BrandDto.from(e, preferZh))
                .toList();
        return toSqlSlice(content, pageSize);
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

    public SliceResponse<BrandDto> searchBrandsSlice(
            String keyword,
            String effectiveLocale,
            int size,
            String cursor) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return SliceResponse.of(Collections.emptyList(), clampSize(size), false, null, 0L, true);
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        int pageSize = clampSize(size);
        boolean firstPage = cursor == null || cursor.isBlank();

        if (CursorCodec.isEsCursor(cursor) || (firstPage && brandEsEnabled())) {
            try {
                List<Object> searchAfter = CursorCodec.isEsCursor(cursor) ? CursorCodec.decodeEs(cursor) : null;
                EsSearchSliceResult esResult = brandElasticsearchQueryService.searchSlice(
                        trimmed, searchAfter, pageSize, firstPage);
                if (!esResult.ids().isEmpty() || CursorCodec.isEsCursor(cursor)) {
                    return fromEsBrandSlice(esResult, preferZh, pageSize);
                }
            } catch (Exception e) {
                if (CursorCodec.isEsCursor(cursor)) {
                    throw e;
                }
                log.warn("Elasticsearch brand search failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandsSqlSlice(trimmed, preferZh, pageSize, cursor, firstPage);
    }

    public SliceResponse<BrandObjectDto> getBrandObjectsSlice(
            long brandId,
            String effectiveLocale,
            int size,
            String cursor) {
        int pageSize = clampSize(size);
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        Long afterId = CursorCodec.decodeSql(cursor);

        List<BrandObjectEntity> entities = afterId == null
                ? brandObjectRepository.findFirstPageByBrandId(brandId, pageSize)
                : brandObjectRepository.findAfterIdByBrandId(brandId, afterId, pageSize);

        List<BrandObjectDto> content = toBrandObjectDtos(entities, preferZh);
        return toSqlSlice(content, pageSize);
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

    public SliceResponse<BrandObjectDto> searchBrandObjectsSlice(
            String keyword,
            String effectiveLocale,
            int size,
            String cursor) {
        return searchBrandObjectsInternal(keyword, null, effectiveLocale, size, cursor);
    }

    public SliceResponse<BrandObjectDto> searchBrandObjectsByBrandIdSlice(
            String keyword,
            long brandId,
            String effectiveLocale,
            int size,
            String cursor) {
        return searchBrandObjectsInternal(keyword, brandId, effectiveLocale, size, cursor);
    }

    private SliceResponse<BrandObjectDto> searchBrandObjectsInternal(
            String keyword,
            Long brandId,
            String effectiveLocale,
            int size,
            String cursor) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return SliceResponse.of(Collections.emptyList(), clampSize(size), false, null, 0L, true);
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        int pageSize = clampSize(size);
        boolean firstPage = cursor == null || cursor.isBlank();

        if (CursorCodec.isEsCursor(cursor) || (firstPage && esEnabled())) {
            try {
                List<Object> searchAfter = CursorCodec.isEsCursor(cursor) ? CursorCodec.decodeEs(cursor) : null;
                EsSearchSliceResult esResult = brandId == null
                        ? brandObjectElasticsearchQueryService.searchSlice(
                                trimmed, searchAfter, pageSize, firstPage)
                        : brandObjectElasticsearchQueryService.searchSliceByBrandId(
                                trimmed, brandId, searchAfter, pageSize, firstPage);
                if (!esResult.ids().isEmpty() || CursorCodec.isEsCursor(cursor)) {
                    return fromEsBrandObjectSlice(esResult, preferZh, pageSize);
                }
            } catch (Exception e) {
                if (CursorCodec.isEsCursor(cursor)) {
                    throw e;
                }
                log.warn("Elasticsearch search failed, using SQL fallback: {}", e.getMessage());
            }
        }

        return searchBrandObjectsSqlSlice(trimmed, brandId, preferZh, pageSize, cursor, firstPage);
    }

    private SliceResponse<BrandDto> searchBrandsSqlSlice(
            String keyword,
            boolean preferZh,
            int pageSize,
            String cursor,
            boolean firstPage) {
        Long afterId = CursorCodec.decodeSql(cursor);
        List<BrandEntity> entities = afterId == null
                ? brandRepository.searchFirstPage(keyword, pageSize)
                : brandRepository.searchAfterId(keyword, afterId, pageSize);
        List<BrandDto> content = entities.stream()
                .map(e -> BrandDto.from(e, preferZh))
                .toList();
        Long total = firstPage ? brandRepository.countSearch(keyword) : null;
        return toSqlSearchSlice(content, pageSize, total);
    }

    private SliceResponse<BrandObjectDto> searchBrandObjectsSqlSlice(
            String keyword,
            Long brandId,
            boolean preferZh,
            int pageSize,
            String cursor,
            boolean firstPage) {
        Long afterId = CursorCodec.decodeSql(cursor);
        List<BrandObjectEntity> entities;
        long total;
        if (brandId == null) {
            entities = afterId == null
                    ? brandObjectRepository.searchFirstPage(keyword, pageSize)
                    : brandObjectRepository.searchAfterId(keyword, afterId, pageSize);
            total = firstPage ? brandObjectRepository.countSearch(keyword) : -1;
        } else {
            entities = afterId == null
                    ? brandObjectRepository.searchFirstPageWithinBrand(keyword, brandId, pageSize)
                    : brandObjectRepository.searchAfterIdWithinBrand(keyword, brandId, afterId, pageSize);
            total = firstPage ? brandObjectRepository.countSearchWithinBrand(keyword, brandId) : -1;
        }
        List<BrandObjectDto> content = toBrandObjectDtos(entities, preferZh);
        return toSqlSearchSlice(content, pageSize, firstPage ? total : null);
    }

    private SliceResponse<BrandDto> fromEsBrandSlice(
            EsSearchSliceResult esResult,
            boolean preferZh,
            int pageSize) {
        List<BrandDto> content = loadByIdsInOrder(
                esResult.ids(),
                brandRepository::findAllById,
                e -> BrandDto.from(e, preferZh));
        return fromEsSlice(content, esResult, pageSize);
    }

    private SliceResponse<BrandObjectDto> fromEsBrandObjectSlice(
            EsSearchSliceResult esResult,
            boolean preferZh,
            int pageSize) {
        List<BrandObjectDto> content = loadByIdsInOrder(
                esResult.ids(),
                brandObjectRepository::findAllById,
                e -> toBrandObjectDto(e, preferZh));
        return fromEsSlice(content, esResult, pageSize);
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

    private <T> SliceResponse<T> fromEsSlice(List<T> content, EsSearchSliceResult esResult, int pageSize) {
        String nextCursor = esResult.hasMore() && esResult.nextSortValues() != null
                ? CursorCodec.encodeEs(esResult.nextSortValues())
                : null;
        return SliceResponse.of(
                content,
                pageSize,
                esResult.hasMore(),
                nextCursor,
                esResult.totalElements(),
                esResult.totalExact());
    }

    private <T> SliceResponse<T> toSqlSlice(List<T> content, int pageSize) {
        boolean hasMore = content.size() == pageSize;
        String nextCursor = hasMore && !content.isEmpty()
                ? CursorCodec.encodeSql(extractId(content.get(content.size() - 1)))
                : null;
        return SliceResponse.ofList(content, pageSize, hasMore, nextCursor);
    }

    private <T> SliceResponse<T> toSqlSearchSlice(List<T> content, int pageSize, Long total) {
        boolean hasMore = content.size() == pageSize;
        String nextCursor = hasMore && !content.isEmpty()
                ? CursorCodec.encodeSql(extractId(content.get(content.size() - 1)))
                : null;
        return SliceResponse.of(content, pageSize, hasMore, nextCursor, total, true);
    }

    private long extractId(Object dto) {
        if (dto instanceof BrandDto brandDto) {
            return brandDto.id();
        }
        if (dto instanceof BrandObjectDto brandObjectDto) {
            return brandObjectDto.id();
        }
        throw new IllegalStateException("Unsupported DTO type: " + dto.getClass());
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
