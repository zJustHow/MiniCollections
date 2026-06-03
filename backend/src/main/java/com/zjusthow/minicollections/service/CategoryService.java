package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.exception.CategoryNotFoundException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.CategoryDto;
import com.zjusthow.minicollections.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final DisplayLocaleResolver displayLocaleResolver;

    public CategoryService(
            CategoryRepository categoryRepository,
            DisplayLocaleResolver displayLocaleResolver) {
        this.categoryRepository = categoryRepository;
        this.displayLocaleResolver = displayLocaleResolver;
    }

    public List<CategoryDto> listAll(String effectiveLocale) {
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return categoryRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(e -> CategoryDto.from(e, preferZh))
                .toList();
    }

    public CategoryEntity requireById(long id) {
        return categoryRepository.findById(id).orElseThrow(CategoryNotFoundException::new);
    }
}
