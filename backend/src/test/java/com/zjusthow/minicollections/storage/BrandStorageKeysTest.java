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
        assertEquals("brands/spark/logo.png", BrandStorageKeys.logoObjectKey(25, "Spark", ".png"));
        assertEquals("brands/ixo-models/logo.png", BrandStorageKeys.logoObjectKey(26, "IXO MODELS", ".png"));
        assertEquals("brands/tsm-model/logo.svg", BrandStorageKeys.logoObjectKey(27, "TSM Model", ".svg"));
        assertEquals("brands/bbr-models/logo.png", BrandStorageKeys.logoObjectKey(31, "BBR MODELS", ".png"));
        assertEquals("brands/bburago/logo.png", BrandStorageKeys.logoObjectKey(32, "Bburago", ".png"));
        assertEquals("brands/hot-wheels/logo.png", BrandStorageKeys.logoObjectKey(33, "Hot Wheels", ".png"));
        assertEquals("brands/welly/logo.png", BrandStorageKeys.logoObjectKey(34, "Welly", ".png"));
        assertEquals("brands/make-up/logo.png", BrandStorageKeys.logoObjectKey(35, "Make Up", ".png"));
        assertEquals("brands/greenlight/logo.png", BrandStorageKeys.logoObjectKey(36, "GreenLight", ".png"));
        assertEquals("brands/mr-collection/logo.png", BrandStorageKeys.logoObjectKey(37, "MR Collection", ".png"));
        assertEquals("brands/topspeed-model/logo.svg", BrandStorageKeys.logoObjectKey(38, "TopSpeed Model", ".svg"));
                assertEquals("brands/almost-real/logo.png", BrandStorageKeys.logoObjectKey(39, "Almost Real (AR)", ".png"));
                assertEquals("brands/gcd/logo.png", BrandStorageKeys.logoObjectKey(40, "GCD", ".png"));
        assertEquals("brands/micro-turbo/logo.png", BrandStorageKeys.logoObjectKey(41, "Micro Turbo (MT)", ".png"));
                assertEquals("brands/tiny/logo.png", BrandStorageKeys.logoObjectKey(42, "Tiny", ".png"));
                assertEquals("brands/bmc/logo.png", BrandStorageKeys.logoObjectKey(43, "BMC", ".png"));
        assertEquals("brands/tomica/logo.png", BrandStorageKeys.logoObjectKey(44, "Tomica", ".png"));
        assertEquals("brands/matchbox/logo.png", BrandStorageKeys.logoObjectKey(45, "Matchbox", ".png"));
        assertEquals("brands/maisto/logo.png", BrandStorageKeys.logoObjectKey(46, "Maisto", ".png"));
        assertEquals("brands/hobby-japan/logo.png", BrandStorageKeys.logoObjectKey(47, "Hobby Japan", ".png"));
        assertEquals("brands/time-micro/logo.png", BrandStorageKeys.logoObjectKey(48, "Time Micro (TM)", ".png"));
        assertEquals("brands/rhino-models/logo.png", BrandStorageKeys.logoObjectKey(49, "Rhino Models", ".png"));
        assertEquals("brands/pop-race/logo.png", BrandStorageKeys.logoObjectKey(50, "Pop Race", ".png"));
        assertEquals("brands/exoto/logo.png", BrandStorageKeys.logoObjectKey(28, "Exoto", ".png"));
        assertEquals("brands/amalgam/logo.png", BrandStorageKeys.logoObjectKey(29, "Amalgam", ".png"));
        assertEquals("brands/cmc/logo.png", BrandStorageKeys.logoObjectKey(30, "CMC", ".png"));
    }

    @Test
    void logoObjectKey_slugifiesUnknownBrands() {
        assertEquals("brands/acme-toys/logo.png", BrandStorageKeys.logoObjectKey(99, "Acme Toys", ".png"));
    }
}
