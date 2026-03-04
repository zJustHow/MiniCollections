package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.model.BrandDto;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.model.BrandObjectDto;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BrandService {
    private final BrandRepository brandRepository;
    private final BrandObjectRepository brandObjectRepository;

    public BrandService(
            BrandRepository brandRepository,
            BrandObjectRepository brandObjectRepository) {
        this.brandRepository = brandRepository;
        this.brandObjectRepository = brandObjectRepository;
    }

    @Cacheable(
            value = "brands",
            key = "'all'"
    )
    public List<BrandDto> getBrands() {
        List<BrandEntity> brandEntities = brandRepository.findAll();
        List<BrandObjectEntity> brandObjectEntities = brandObjectRepository.findAll();
        Map<Long, List<BrandObjectEntity>> brandObjectEntitiesMap = brandObjectEntities.stream()
                .collect(Collectors.groupingBy(BrandObjectEntity::brandId));

        return brandEntities.stream()
                .map(brandEntity -> {
                    List<BrandObjectEntity> brandObjectEntitiesList = brandObjectEntitiesMap.getOrDefault(brandEntity.id(), Collections.emptyList());
                    List<BrandObjectDto> brandObjectDtos = brandObjectEntitiesList.stream()
                            .map(BrandObjectDto::new)
                            .toList();
                    return new BrandDto(brandEntity, brandObjectDtos);
                })
                .toList();
    }

    @Cacheable(
            value = "brands",
            key = "#id"
    )
    public BrandDto getBrandById(long id) {
        List<BrandDto> brandDtos = getBrands();
        return brandDtos.stream()
                .filter(brandDto -> brandDto.id().equals(id))
                        .findFirst()
                        .orElseThrow(() -> new BrandNotFoundException());
    }

    @Cacheable(
            value = "brands",
            key = "'search_' + #keyword"
    )
    public List<BrandDto> searchBrands(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<BrandDto> brandDtos = getBrands();

        String lowerCaseKeyword = keyword.toLowerCase();

        return brandDtos.stream()
                .filter(brandDto -> brandDto.name().toLowerCase().contains(lowerCaseKeyword))
                .toList();
    }

    @Cacheable(
            value = "brandObjects",
            key = "#brandId"
    )
    public List<BrandObjectDto> getBrandObjectsByBrandId(long brandId) {
        return brandObjectRepository.findByBrandId(brandId)
                .orElse(Collections.emptyList())
                .stream()
                .map(BrandObjectDto::new)
                .toList();
    }

    @Cacheable(
            value = "brandObjects",
            key = "'id_' + #id"
    )
    public BrandObjectDto getBrandObjectById(long id) {
        BrandObjectEntity entity = brandObjectRepository.findById(id)
                .orElseThrow(BrandNotFoundException::new);
        return new BrandObjectDto(entity);
    }
}
