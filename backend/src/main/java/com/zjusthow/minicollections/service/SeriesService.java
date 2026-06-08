package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.exception.BrandNotFoundException;
import com.zjusthow.minicollections.exception.SeriesNotFoundException;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.SeriesBody;
import com.zjusthow.minicollections.model.SeriesDto;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final BrandRepository brandRepository;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final BrandObjectIndexService brandObjectIndexService;

    public SeriesService(
            SeriesRepository seriesRepository,
            BrandRepository brandRepository,
            DisplayLocaleResolver displayLocaleResolver,
            @Autowired(required = false) BrandObjectIndexService brandObjectIndexService) {
        this.seriesRepository = seriesRepository;
        this.brandRepository = brandRepository;
        this.displayLocaleResolver = displayLocaleResolver;
        this.brandObjectIndexService = brandObjectIndexService;
    }

    public List<SeriesDto> listByBrandId(long brandId, String effectiveLocale) {
        if (!brandRepository.existsById(brandId)) {
            throw new BrandNotFoundException();
        }
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        return seriesRepository.findByBrandIdOrderByIdAsc(brandId).stream()
                .map(e -> SeriesDto.from(e, preferZh))
                .toList();
    }

    public SeriesDto create(long brandId, SeriesBody body, String effectiveLocale) {
        if (!brandRepository.existsById(brandId)) {
            throw new BrandNotFoundException();
        }
        SeriesEntity saved = seriesRepository.save(new SeriesEntity(
                null, brandId, body.nameEn(), body.nameZh()));
        return SeriesDto.from(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    public SeriesDto update(long id, SeriesBody body, String effectiveLocale) {
        SeriesEntity existing = seriesRepository.findById(id).orElseThrow(SeriesNotFoundException::new);
        SeriesEntity saved = seriesRepository.save(new SeriesEntity(
                id, existing.brandId(), body.nameEn(), body.nameZh()));
        if (brandObjectIndexService != null) {
            brandObjectIndexService.reindexForSeries(id);
        }
        return SeriesDto.from(saved, displayLocaleResolver.prefersZh(effectiveLocale));
    }

    public void delete(long id) {
        if (!seriesRepository.existsById(id)) {
            throw new SeriesNotFoundException();
        }
        seriesRepository.deleteById(id);
    }
}
