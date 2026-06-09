package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.exception.IdentifierExistsException;
import com.zjusthow.minicollections.exception.ScaleNotFoundException;
import com.zjusthow.minicollections.exception.ValidationException;
import com.zjusthow.minicollections.model.ScaleBody;
import com.zjusthow.minicollections.model.ScaleDto;
import com.zjusthow.minicollections.repository.BrandObjectRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScaleService {

    private final ScaleRepository scaleRepository;
    private final BrandObjectRepository brandObjectRepository;
    private final BrandObjectIndexService brandObjectIndexService;

    public ScaleService(
            ScaleRepository scaleRepository,
            BrandObjectRepository brandObjectRepository,
            @Autowired(required = false) BrandObjectIndexService brandObjectIndexService) {
        this.scaleRepository = scaleRepository;
        this.brandObjectRepository = brandObjectRepository;
        this.brandObjectIndexService = brandObjectIndexService;
    }

    @Cacheable(value = "scales", key = "'all'")
    public List<ScaleDto> listAll() {
        return scaleRepository.findAllByOrderByDenominatorAscIdAsc().stream()
                .map(ScaleDto::from)
                .toList();
    }

    public ScaleEntity requireById(long id) {
        return scaleRepository.findById(id).orElseThrow(ScaleNotFoundException::new);
    }

    @CacheEvict(value = "scales", allEntries = true)
    public ScaleDto create(ScaleBody body) {
        String code = normalizeCode(body.code());
        int denominator = requireDenominator(body.denominator());
        if (scaleRepository.existsByCode(code)) {
            throw new IdentifierExistsException("error.identifier_in_use", code);
        }
        ScaleEntity saved = scaleRepository.save(new ScaleEntity(null, code, denominator));
        return ScaleDto.from(saved);
    }

    @CacheEvict(value = "scales", allEntries = true)
    public ScaleDto update(long id, ScaleBody body) {
        requireById(id);
        String code = normalizeCode(body.code());
        int denominator = requireDenominator(body.denominator());
        if (scaleRepository.existsByCodeAndIdNot(code, id)) {
            throw new IdentifierExistsException("error.identifier_in_use", code);
        }
        ScaleEntity saved = scaleRepository.save(new ScaleEntity(id, code, denominator));
        if (brandObjectIndexService != null) {
            brandObjectIndexService.reindexForScale(id);
        }
        return ScaleDto.from(saved);
    }

    @CacheEvict(value = "scales", allEntries = true)
    public void delete(long id) {
        if (!scaleRepository.existsById(id)) {
            throw new ScaleNotFoundException();
        }
        List<Long> affectedObjectIds = brandObjectRepository.findByScaleId(id).stream()
                .map(entity -> entity.id())
                .toList();
        scaleRepository.deleteById(id);
        if (brandObjectIndexService != null && !affectedObjectIds.isEmpty()) {
            brandObjectIndexService.reindexByIds(affectedObjectIds);
        }
    }

    private static String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new ValidationException("error.validation_failed");
        }
        return code.strip();
    }

    private static int requireDenominator(Integer denominator) {
        if (denominator == null || denominator <= 0) {
            throw new ValidationException("error.validation_failed");
        }
        return denominator;
    }
}
