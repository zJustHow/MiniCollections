package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.exception.ScaleNotFoundException;
import com.zjusthow.minicollections.model.ScaleDto;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScaleServiceTest {

    @Mock ScaleRepository scaleRepository;

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
    void requireById_throwsWhenMissing() {
        when(scaleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ScaleNotFoundException.class, () -> scaleService.requireById(99L));
    }

    @Test
    void requireById_returnsEntity() {
        ScaleEntity entity = new ScaleEntity(3L, "1:18", 18);
        when(scaleRepository.findById(3L)).thenReturn(Optional.of(entity));

        assertEquals(entity, scaleService.requireById(3L));
    }
}
