package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.exception.CategoryNotFoundException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @Mock DisplayLocaleResolver displayLocaleResolver;

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
    void requireById_throwsWhenMissing() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CategoryNotFoundException.class, () -> categoryService.requireById(99L));
    }

    @Test
    void requireById_returnsEntity() {
        CategoryEntity entity = new CategoryEntity(3L, "trucks", "Trucks", "卡车", 1);
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(entity));

        assertEquals(entity, categoryService.requireById(3L));
    }
}
