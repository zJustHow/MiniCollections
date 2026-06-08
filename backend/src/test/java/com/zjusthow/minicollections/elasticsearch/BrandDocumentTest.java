package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandEntity;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class BrandDocumentTest {

    @Test
    void from_mapsBrandEntityFields() {
        BrandEntity entity = new BrandEntity(1L, "Kyosho", "京商", " K ", "logo.png", 12L);

        BrandDocument document = BrandDocument.from(entity);

        assertEquals(1L, document.id());
        assertEquals("Kyosho", document.nameEn());
        assertEquals("京商", document.nameZh());
        assertEquals("K", document.abbreviation());
        assertEquals(12L, document.viewCount());
    }

    @Test
    void from_blankAbbreviationBecomesNull() {
        BrandEntity entity = new BrandEntity(2L, "Brand", null, "  ", null, 0L);

        BrandDocument document = BrandDocument.from(entity);

        assertNull(document.abbreviation());
    }
}
