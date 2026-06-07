package com.zjusthow.minicollections.image;

import java.nio.file.Files;
import java.nio.file.Path;

/** Local file preview for {@link BrandLogoNormalizer}. */
public final class BrandLogoNormalizeCli {

    private BrandLogoNormalizeCli() {
    }

    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: BrandLogoNormalizeCli <input> <output>");
            System.exit(1);
        }
        Path input = Path.of(args[0]);
        Path output = Path.of(args[1]);
        String contentType = contentTypeForName(input.getFileName().toString());
        byte[] raw = Files.readAllBytes(input);
        NormalizedBrandLogo normalized = BrandLogoNormalizer.normalize(raw, contentType);
        Files.write(output, normalized.bytes());
        System.out.println("Wrote " + output.toAbsolutePath() + " (" + normalized.contentType() + ")");
    }

    private static String contentTypeForName(String name) {
        String lower = name.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/png";
    }
}
