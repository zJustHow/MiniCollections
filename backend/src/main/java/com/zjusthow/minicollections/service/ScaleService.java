package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.exception.ScaleNotFoundException;
import com.zjusthow.minicollections.model.ScaleDto;
import com.zjusthow.minicollections.repository.ScaleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScaleService {

    private final ScaleRepository scaleRepository;

    public ScaleService(ScaleRepository scaleRepository) {
        this.scaleRepository = scaleRepository;
    }

    public List<ScaleDto> listAll() {
        return scaleRepository.findAllByOrderByDenominatorAscIdAsc().stream()
                .map(ScaleDto::from)
                .toList();
    }

    public ScaleEntity requireById(long id) {
        return scaleRepository.findById(id).orElseThrow(ScaleNotFoundException::new);
    }
}
