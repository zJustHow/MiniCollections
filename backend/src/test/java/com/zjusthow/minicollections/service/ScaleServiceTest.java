package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import com.zjusthow.minicollections.entity.BrandObjectEntity;
import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.ScaleNotFoundException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.model.ScaleBody;
import com.zjusthow.minicollections.model.ScaleDto;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class ScaleServiceTest {

    @Mock ScaleRepository scaleRepository;
    @Mock BrandObjectRepository brandObjectRepository;
    @Mock BrandObjectIndexService brandObjectIndexService;

    @InjectMocks ScaleService scaleService;

    @Test
    void listAll_mapsEntitiesToDtos() {
        when(scaleRepository.findAllByOrderByDenominatorAscIdAsc()).thenReturn(List.of(
                new ScaleEntity(1L, "1:64", 64),
                new ScaleEntity(2L, "1:43", 43)));

        List<ScaleDto> result = scaleService.listAll();

        assertEquals(2, result.size());
        assertEquals("1:64", result.get(0).code());
        assertEquals("1:43", result.get(1).code());
    }

    @Test
    void create_persistsScale() {
        ScaleBody body = new ScaleBody("1:72", 72);
        ScaleEntity saved = new ScaleEntity(72L, "1:72", 72);
        when(scaleRepository.existsByCode("1:72")).thenReturn(false);
        when(scaleRepository.save(any(ScaleEntity.class))).thenReturn(saved);

        ScaleDto result = scaleService.create(body);

        assertEquals("1:72", result.code());
    }

    @Test
    void create_rejectsDuplicateCode() {
        when(scaleRepository.existsByCode("1:64")).thenReturn(true);

        assertThrows(IdentifierExistsException.class,
                () -> scaleService.create(new ScaleBody("1:64", 64)));
    }

    @Test
    void update_reindexesAffectedObjects() {
        ScaleEntity existing = new ScaleEntity(64L, "1:64", 64);
        ScaleBody body = new ScaleBody("1:64", 64);
        when(scaleRepository.findById(64L)).thenReturn(Optional.of(existing));
        when(scaleRepository.existsByCodeAndIdNot("1:64", 64L)).thenReturn(false);
        when(scaleRepository.save(any(ScaleEntity.class))).thenReturn(existing);

        scaleService.update(64L, body);

        verify(brandObjectIndexService).reindexForScale(64L);
    }

    @Test
    void delete_reindexesPreviouslyLinkedObjects() {
        BrandObjectEntity object = new BrandObjectEntity(
                10L, "Model", null, null, null, null, null, null, 1L, null, 1L, 64L, 0L);
        when(scaleRepository.existsById(64L)).thenReturn(true);
        when(brandObjectRepository.findByScaleId(64L)).thenReturn(List.of(object));

        scaleService.delete(64L);

        verify(scaleRepository).deleteById(64L);
        verify(brandObjectIndexService).reindexByIds(List.of(10L));
    }

    @Test
    void requireById_throwsWhenMissing() {
        when(scaleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ScaleNotFoundException.class, () -> scaleService.requireById(99L));
    }

    @Test
    void create_rejectsInvalidDenominator() {
        assertThrows(ValidationException.class,
                () -> scaleService.create(new ScaleBody("1:0", 0)));
        verify(scaleRepository, never()).save(any());
    }
}
