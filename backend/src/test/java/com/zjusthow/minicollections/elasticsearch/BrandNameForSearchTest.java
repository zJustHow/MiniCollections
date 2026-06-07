package com.zjusthow.minicollections.elasticsearch;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class BrandNameForSearchTest {

    @Test
    void forIndex_expandsNameWithAbbreviation() {
        assertEquals("MINI GT MGT minigt", BrandNameForSearch.forIndex("MINI GT (MGT)"));
        assertEquals("AutoArt AA autoart", BrandNameForSearch.forIndex("AutoArt (AA)"));
        assertEquals("Time Micro TM timemicro", BrandNameForSearch.forIndex("Time Micro (TM)"));
    }

    @Test
    void forIndex_leavesPlainNamesUnchanged() {
        assertEquals("Kyosho", BrandNameForSearch.forIndex("Kyosho"));
        assertEquals("Hot Wheels", BrandNameForSearch.forIndex("Hot Wheels"));
    }

    @Test
    void forIndex_handlesNullAndBlank() {
        assertNull(BrandNameForSearch.forIndex(null));
        assertEquals("  ", BrandNameForSearch.forIndex("  "));
    }

    @Test
    void forIndex_trimsInput() {
        assertEquals("MINI GT MGT minigt", BrandNameForSearch.forIndex("  MINI GT (MGT)  "));
    }
}
