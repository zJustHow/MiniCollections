package com.zjusthow.minicollections.storage;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BrandStorageKeysTest {

    @Test
    void logoObjectKey_usesKnownPrefixForSeedBrands() {
        assertEquals("brands/minigt/logo.svg", BrandStorageKeys.logoObjectKey(1, "MINI GT", ".svg"));
        assertEquals("brands/lcd/logo.png", BrandStorageKeys.logoObjectKey(2, "LCD", ".png"));
        assertEquals("brands/autoart/logo.svg", BrandStorageKeys.logoObjectKey(3, "AutoArt", ".svg"));
        assertEquals("brands/tomica-limited-vintage/logo.svg", BrandStorageKeys.logoObjectKey(4, "Tomica Limited Vintage (TLV)", ".svg"));
        assertEquals("brands/kyosho/logo.png", BrandStorageKeys.logoObjectKey(5, "Kyosho", ".png"));
        assertEquals("brands/minichamps/logo.png", BrandStorageKeys.logoObjectKey(6, "Minichamps", ".png"));
        assertEquals("brands/xcartoys/logo.png", BrandStorageKeys.logoObjectKey(7, "XCarToys", ".png"));
        assertEquals("brands/inno-models/logo.png", BrandStorageKeys.logoObjectKey(8, "Inno Models", ".png"));
        assertEquals("brands/ignition-model/logo.png", BrandStorageKeys.logoObjectKey(9, "Ignition Model (IG)", ".png"));
        assertEquals("brands/tarmac-works/logo.png", BrandStorageKeys.logoObjectKey(13, "TARMAC WORKS", ".png"));
        assertEquals("brands/figart-model/logo.png", BrandStorageKeys.logoObjectKey(21, "FIGART MODEL", ".png"));
        assertEquals("brands/frontiart/logo.png", BrandStorageKeys.logoObjectKey(22, "FrontiArt (FA)", ".png"));
        assertEquals("brands/looksmart/logo.png", BrandStorageKeys.logoObjectKey(23, "Looksmart", ".png"));
        assertEquals("brands/norev/logo.png", BrandStorageKeys.logoObjectKey(24, "Norev", ".png"));
        assertEquals("brands/spark/logo.ico", BrandStorageKeys.logoObjectKey(25, "Spark", ".ico"));
        assertEquals("brands/ixo-models/logo.png", BrandStorageKeys.logoObjectKey(26, "IXO MODELS", ".png"));
        assertEquals("brands/tsm-model/logo.ico", BrandStorageKeys.logoObjectKey(27, "TSM Model", ".ico"));
        assertEquals("brands/bbr-models/logo.png", BrandStorageKeys.logoObjectKey(31, "BBR MODELS", ".png"));
        assertEquals("brands/exoto/logo.png", BrandStorageKeys.logoObjectKey(28, "Exoto", ".png"));
        assertEquals("brands/amalgam/logo.png", BrandStorageKeys.logoObjectKey(29, "Amalgam", ".png"));
        assertEquals("brands/cmc/logo.png", BrandStorageKeys.logoObjectKey(30, "CMC", ".png"));
    }

    @Test
    void logoObjectKey_slugifiesUnknownBrands() {
        assertEquals("brands/acme-toys/logo.png", BrandStorageKeys.logoObjectKey(99, "Acme Toys", ".png"));
    }
}
