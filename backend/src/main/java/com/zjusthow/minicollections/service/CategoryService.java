package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.exception.CategoryNotFoundException;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryBody;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class CategoryService {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

    private final CategoryRepository categoryRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final BrandObjectIndexService brandObjectIndexService;

    public CategoryService(
            CategoryRepository categoryRepository,
            BrandObjectRepository brandObjectRepository,
            DisplayLocaleResolver displayLocaleResolver,
            @Autowired(required = false) BrandObjectIndexService brandObjectIndexService) {
        this.categoryRepository = categoryRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.displayLocaleResolver = displayLocaleResolver;
        this.brandObjectIndexService = brandObjectIndexService;
    }

    @Cacheable(
            value = "categories",
            key = "'all_' + @displayLocaleResolver.prefersZh(#effectiveLocale)")
    public List<CategoryDto> listAll(String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return categoryRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(e -> CategoryDto.from(e, preferZh))
                .toList();
    }

    public CategoryEntity requireById(long id) {
        return categoryRepository.findById(id).orElseThrow(CategoryNotFoundException::new);
    }

    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto create(CategoryBody body, String effectiveLocale) {
        String slug = normalizeSlug(body.slug());
        String nameEn = requireText(body.nameEn(), "nameEn");
        int sortOrder = body.sortOrder() != null ? body.sortOrder() : 0;
        if (sortOrder < 0) {
            throw new ValidationException("error.validation_failed");
        }
        if (categoryRepository.existsBySlug(slug)) {
            throw new IdentifierExistsException("error.identifier_in_use", slug);
        }
        CategoryEntity saved = categoryRepository.save(new CategoryEntity(
                null, slug, nameEn, trimToNull(body.nameZh()), sortOrder));
        return CategoryDto.from(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto update(long id, CategoryBody body, String effectiveLocale) {
        CategoryEntity existing = requireById(id);
        String slug = normalizeSlug(body.slug());
        String nameEn = requireText(body.nameEn(), "nameEn");
        int sortOrder = body.sortOrder() != null ? body.sortOrder() : existing.sortOrder();
        if (sortOrder < 0) {
            throw new ValidationException("error.validation_failed");
        }
        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new IdentifierExistsException("error.identifier_in_use", slug);
        }
        CategoryEntity saved = categoryRepository.save(new CategoryEntity(
                id, slug, nameEn, trimToNull(body.nameZh()), sortOrder));
        if (brandObjectIndexService != null) {
            brandObjectIndexService.reindexForCategory(id);
        }
        return CategoryDto.from(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    @CacheEvict(value = "categories", allEntries = true)
    public void delete(long id) {
        if (!categoryRepository.existsById(id)) {
            throw new CategoryNotFoundException();
        }
        List<Long> affectedObjectIds = brandObjectRepository.findByCategoryId(id).stream()
                .map(entity -> entity.id())
                .toList();
        categoryRepository.deleteById(id);
        if (brandObjectIndexService != null && !affectedObjectIds.isEmpty()) {
            brandObjectIndexService.reindexByIds(affectedObjectIds);
        }
    }

    private static String normalizeSlug(String slug) {
        String normalized = requireText(slug, "slug").toLowerCase();
        if (!SLUG_PATTERN.matcher(normalized).matches()) {
            throw new ValidationException("error.validation_failed");
        }
        return normalized;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ValidationException("error.validation_failed");
        }
        return value.strip();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.strip();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
