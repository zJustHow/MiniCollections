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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeriesServiceTest {

    @Mock SeriesRepository seriesRepository;
    @Mock BrandRepository brandRepository;
    @Mock DisplayLocaleResolver displayLocaleResolver;
    @Mock BrandObjectIndexService brandObjectIndexService;

    @InjectMocks SeriesService seriesService;

    @Test
    void listByBrandId_throwsWhenBrandMissing() {
        when(brandRepository.existsById(99L)).thenReturn(false);

        assertThrows(BrandNotFoundException.class, () -> seriesService.listByBrandId(99L, "en-US"));
    }

    @Test
    void listByBrandId_returnsLocalizedSeries() {
        when(brandRepository.existsById(2L)).thenReturn(true);
        when(seriesRepository.findByBrandIdOrderByIdAsc(2L))
                .thenReturn(List.of(new SeriesEntity(1L, 2L, "GT", "GT系列")));
        when(displayLocaleResolver.prefersZh("zh-CN")).thenReturn(true);

        List<SeriesDto> result = seriesService.listByBrandId(2L, "zh-CN");

        assertEquals(1, result.size());
        assertEquals("GT系列", result.get(0).name());
        assertEquals("GT", result.get(0).nameEn());
        assertEquals("GT系列", result.get(0).nameZh());
    }

    @Test
    void create_savesSeriesForBrand() {
        when(brandRepository.existsById(2L)).thenReturn(true);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);
        SeriesEntity saved = new SeriesEntity(5L, 2L, "New Series", null);
        when(seriesRepository.save(any(SeriesEntity.class))).thenReturn(saved);

        SeriesBody body = new SeriesBody("New Series", null);
        SeriesDto result = seriesService.create(2L, body, "en-US");

        assertEquals("New Series", result.nameEn());
        ArgumentCaptor<SeriesEntity> captor = ArgumentCaptor.forClass(SeriesEntity.class);
        verify(seriesRepository).save(captor.capture());
        assertEquals(2L, captor.getValue().brandId());
        assertNull(captor.getValue().nameZh());
    }

    @Test
    void update_reindexesWhenIndexServicePresent() {
        SeriesEntity existing = new SeriesEntity(5L, 2L, "Old", null);
        SeriesEntity saved = new SeriesEntity(5L, 2L, "New", "新系列");
        when(seriesRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(seriesRepository.save(any(SeriesEntity.class))).thenReturn(saved);
        when(displayLocaleResolver.prefersZh("en-US")).thenReturn(false);

        SeriesDto result = seriesService.update(5L, new SeriesBody("New", "新系列"), "en-US");

        assertEquals("New", result.nameEn());
        assertEquals("新系列", result.nameZh());
        verify(brandObjectIndexService).reindexForSeries(5L);
    }

    @Test
    void delete_throwsWhenMissing() {
        when(seriesRepository.existsById(8L)).thenReturn(false);

        assertThrows(SeriesNotFoundException.class, () -> seriesService.delete(8L));
        verify(seriesRepository, never()).deleteById(8L);
    }

    @Test
    void delete_removesSeries() {
        when(seriesRepository.existsById(8L)).thenReturn(true);

        seriesService.delete(8L);

        verify(seriesRepository).deleteById(8L);
    }
}
