package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.exception.CategoryNotFoundException;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryBody;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @Mock BrandObjectRepository brandObjectRepository;
    @Mock DisplayLocaleResolver displayLocaleResolver;
    @Mock BrandObjectIndexService brandObjectIndexService;

    @InjectMocks CategoryService categoryService;

    @Test
    void listAll_prefersEnglishNames() {
        CategoryEntity entity = new CategoryEntity(1L, "cars", "Cars", "汽车", 0);
        when(categoryRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of(entity));
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);

        List<CategoryDto> result = categoryService.listAll("en-US");

        assertEquals(1, result.size());
        assertEquals("Cars", result.get(0).name());
    }

    @Test
    void listAll_prefersChineseNames() {
        CategoryEntity entity = new CategoryEntity(1L, "cars", "Cars", "汽车", 0);
        when(categoryRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of(entity));
        when(displayLocaleResolver.prefersZh("zh-CN")).thenReturn(true);

        List<CategoryDto> result = categoryService.listAll("zh-CN");

        assertEquals("汽车", result.get(0).name());
    }

    @Test
    void create_persistsNormalizedSlug() {
        CategoryBody body = new CategoryBody("Custom-Car", "Custom Car", "定制车", 23);
        CategoryEntity saved = new CategoryEntity(23L, "custom-car", "Custom Car", "定制车", 23);
        when(categoryRepository.existsBySlug("custom-car")).thenReturn(false);
        when(categoryRepository.save(any(CategoryEntity.class))).thenReturn(saved);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);

        CategoryDto result = categoryService.create(body, "en-US");

        ArgumentCaptor<CategoryEntity> captor = ArgumentCaptor.forClass(CategoryEntity.class);
        verify(categoryRepository).save(captor.capture());
        assertEquals("custom-car", captor.getValue().slug());
        assertEquals("Custom Car", result.name());
    }

    @Test
    void create_rejectsDuplicateSlug() {
        when(categoryRepository.existsBySlug("cars")).thenReturn(true);

        assertThrows(IdentifierExistsException.class,
                () -> categoryService.create(new CategoryBody("cars", "Cars", null, 1), "en-US"));
    }

    @Test
    void update_reindexesAffectedObjects() {
        CategoryEntity existing = new CategoryEntity(3L, "trucks", "Trucks", "卡车", 4);
        CategoryBody body = new CategoryBody("trucks", "Heavy Trucks", "重卡", 4);
        CategoryEntity saved = new CategoryEntity(3L, "trucks", "Heavy Trucks", "重卡", 4);
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(categoryRepository.existsBySlugAndIdNot("trucks", 3L)).thenReturn(false);
        when(categoryRepository.save(any(CategoryEntity.class))).thenReturn(saved);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);

        categoryService.update(3L, body, "en-US");

        verify(brandObjectIndexService).reindexForCategory(3L);
    }

    @Test
    void delete_reindexesPreviouslyLinkedObjects() {
        BrandObjectEntity object = new BrandObjectEntity(
                10L, "Model", null, null, null, null, null, null, 1L, null, 3L, 64L, 0L);
        when(categoryRepository.existsById(3L)).thenReturn(true);
        when(brandObjectRepository.findByCategoryId(3L)).thenReturn(List.of(object));

        categoryService.delete(3L);

        verify(categoryRepository).deleteById(3L);
        verify(brandObjectIndexService).reindexByIds(List.of(10L));
    }

    @Test
    void requireById_throwsWhenMissing() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CategoryNotFoundException.class, () -> categoryService.requireById(99L));
    }

    @Test
    void create_rejectsInvalidSlug() {
        assertThrows(ValidationException.class,
                () -> categoryService.create(new CategoryBody("bad slug", "Cars", null, 1), "en-US"));
        verify(categoryRepository, never()).save(any());
    }
}
