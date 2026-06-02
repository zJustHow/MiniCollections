package com.zjusthow.minicollections.storage;

import java.util.Locale;

/**
 * Object keys under the media bucket for brand assets (e.g. logos).
 * Seed brands use the same folder names as product images ({@code minigt/}, {@code lcd/}, …).
 */
public final class BrandStorageKeys {

    private BrandStorageKeys() {
    }

    public static String storagePrefix(long brandId, String nameEn) {
        return switch ((int) brandId) {
            case 1 -> "minigt";
            case 2 -> "lcd";
            case 3 -> "autoart";
            case 4 -> "tomica-limited-vintage";
            case 5 -> "kyosho";
            case 6 -> "minichamps";
            case 7 -> "xcartoys";
            case 8 -> "inno-models";
            case 9 -> "ignition-model";
            case 10 -> "kengfai";
            case 11 -> "kj-miniatures";
            case 12 -> "motorhelix";
            case 13 -> "tarmac-works";
            case 14 -> "modelcollect";
            case 15 -> "private-goods-model";
            case 16 -> "werk83";
            case 17 -> "kiloworks";
            case 18 -> "topart-collection";
            case 19 -> "autoworld";
            case 20 -> "polar-master";
            case 21 -> "figart-model";
            case 22 -> "frontiart";
            case 23 -> "looksmart";
            case 24 -> "norev";
            case 25 -> "spark";
            case 26 -> "ixo-models";
            case 27 -> "tsm-model";
            case 28 -> "exoto";
            case 29 -> "amalgam";
            case 30 -> "cmc";
            case 31 -> "bbr-models";
            case 32 -> "bburago";
            case 33 -> "hot-wheels";
            case 34 -> "welly";
            case 35 -> "make-up";
            case 36 -> "greenlight";
            case 37 -> "mr-collection";
            case 38 -> "topspeed-model";
            default -> slugify(nameEn);
        };
    }

    public static String logoObjectKey(long brandId, String nameEn, String extensionWithDot) {
        String ext = extensionWithDot.startsWith(".") ? extensionWithDot : "." + extensionWithDot;
        return "brands/" + storagePrefix(brandId, nameEn) + "/logo" + ext;
    }

    private static String slugify(String nameEn) {
        if (nameEn == null || nameEn.isBlank()) {
            return "unknown";
        }
        String slug = nameEn.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        return slug.isEmpty() ? "unknown" : slug;
    }
}
