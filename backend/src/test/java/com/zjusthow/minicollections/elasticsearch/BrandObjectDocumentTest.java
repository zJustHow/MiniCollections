package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class BrandObjectDocumentTest {

    @Test
    void from_mapsEntityAndRelatedNames() {
        BrandObjectEntity entity = new BrandObjectEntity(
                10L, "BMW M3", "宝马M3", "img.png", "src",
                new BigDecimal("199.00"), null, LocalDate.of(2024, 3, 1),
                2L, 3L, 4L, 5L, 7L);

        BrandObjectDocument document = BrandObjectDocument.from(
                entity, "BMW", " B ", "宝马", "M Series", "M系列",
                "Cars", "汽车", "1:64");

        assertEquals(10L, document.id());
        assertEquals("BMW M3", document.nameEn());
        assertEquals("宝马M3", document.nameZh());
        assertEquals("B", document.brandAbbreviation());
        assertEquals("1:64", document.scale());
        assertEquals(7L, document.viewCount());
    }

    @Test
    void from_blankAbbreviationBecomesNull() {
        BrandObjectEntity entity = new BrandObjectEntity(
                1L, "Model", null, null, null, null, null, null,
                1L, null, null, null, 0L);

        BrandObjectDocument document = BrandObjectDocument.from(
                entity, "Brand", "  ", null, null, null, null, null, "1:43");

        assertNull(document.brandAbbreviation());
    }
}
