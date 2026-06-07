package com.zjusthow.minicollections.image;

import java.util.ArrayList;
import java.util.List;

public final class BrandLogoNormalizationReport {

    private int updated;
    private int unchanged;
    private int skippedSvg;
    private int skippedExternal;
    private int skippedNoImage;
    private int failed;
    private final List<String> details = new ArrayList<>();

    public void recordUpdated(long brandId, String name) {
        updated++;
        details.add("updated brand " + brandId + " (" + name + ")");
    }

    public void recordUnchanged(long brandId, String name) {
        unchanged++;
        details.add("unchanged brand " + brandId + " (" + name + ")");
    }

    public void recordSkippedSvg(long brandId, String name) {
        skippedSvg++;
        details.add("skipped svg brand " + brandId + " (" + name + ")");
    }

    public void recordSkippedExternal(long brandId, String name) {
        skippedExternal++;
        details.add("skipped external url brand " + brandId + " (" + name + ")");
    }

    public void recordSkippedNoImage(long brandId, String name) {
        skippedNoImage++;
        details.add("skipped no image brand " + brandId + " (" + name + ")");
    }

    public void recordFailed(long brandId, String name, String reason) {
        failed++;
        details.add("failed brand " + brandId + " (" + name + "): " + reason);
    }

    public int updated() {
        return updated;
    }

    public int unchanged() {
        return unchanged;
    }

    public int skippedSvg() {
        return skippedSvg;
    }

    public int skippedExternal() {
        return skippedExternal;
    }

    public int skippedNoImage() {
        return skippedNoImage;
    }

    public int failed() {
        return failed;
    }

    public List<String> details() {
        return List.copyOf(details);
    }

    @Override
    public String toString() {
        return "BrandLogoNormalizationReport{"
                + "updated=" + updated
                + ", unchanged=" + unchanged
                + ", skippedSvg=" + skippedSvg
                + ", skippedExternal=" + skippedExternal
                + ", skippedNoImage=" + skippedNoImage
                + ", failed=" + failed
                + "}";
    }
}
