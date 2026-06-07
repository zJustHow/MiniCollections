package com.zjusthow.minicollections.image;

import javax.imageio.ImageIO;
import java.awt.AlphaComposite;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Locale;

/**
 * Normalizes brand logo uploads while preserving the original image dimensions.
 * Raster images are trimmed (transparent or near-white borders), scaled so the
 * longest edge fills the canvas, and exported as PNG.
 */
public final class BrandLogoNormalizer {

    private static final int ALPHA_THRESHOLD = 16;
    private static final int WHITE_THRESHOLD = 250;

    private BrandLogoNormalizer() {
    }

    public static NormalizedBrandLogo normalize(byte[] input, String contentType) throws IOException {
        String type = contentType.toLowerCase(Locale.ROOT);
        if ("image/svg+xml".equals(type)) {
            return NormalizedBrandLogo.unchanged(input, contentType);
        }
        BufferedImage source = ImageIO.read(new ByteArrayInputStream(input));
        if (source == null) {
            return NormalizedBrandLogo.unchanged(input, contentType);
        }
        BufferedImage argb = toArgb(source);
        Rectangle bounds = findContentBounds(argb);
        if (bounds == null) {
            return NormalizedBrandLogo.unchanged(input, contentType);
        }
        BufferedImage trimmed = argb.getSubimage(bounds.x, bounds.y, bounds.width, bounds.height);
        BufferedImage canvas = renderOnCanvas(trimmed, argb.getWidth(), argb.getHeight());
        return new NormalizedBrandLogo(writePng(canvas), "image/png");
    }

    private static BufferedImage toArgb(BufferedImage source) {
        if (source.getType() == BufferedImage.TYPE_INT_ARGB) {
            return source;
        }
        BufferedImage argb = new BufferedImage(
                source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = argb.createGraphics();
        g.setComposite(AlphaComposite.Src);
        g.drawImage(source, 0, 0, null);
        g.dispose();
        return argb;
    }

    static Rectangle findContentBounds(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        boolean trimWhite = !hasMeaningfulTransparency(image);

        int minX = width;
        int minY = height;
        int maxX = -1;
        int maxY = -1;

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (isContentPixel(image.getRGB(x, y), trimWhite)) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        if (maxX < minX || maxY < minY) {
            return null;
        }
        return new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
    }

    private static boolean hasMeaningfulTransparency(BufferedImage image) {
        if (!image.getColorModel().hasAlpha()) {
            return false;
        }
        int width = image.getWidth();
        int height = image.getHeight();
        int stepX = Math.max(1, width / 32);
        int stepY = Math.max(1, height / 32);
        for (int y = 0; y < height; y += stepY) {
            for (int x = 0; x < width; x += stepX) {
                int alpha = (image.getRGB(x, y) >> 24) & 0xFF;
                if (alpha < WHITE_THRESHOLD) {
                    return true;
                }
            }
        }
        return false;
    }

    static boolean isContentPixel(int argb, boolean trimWhite) {
        int alpha = (argb >> 24) & 0xFF;
        if (!trimWhite) {
            return alpha >= ALPHA_THRESHOLD;
        }
        int red = (argb >> 16) & 0xFF;
        int green = (argb >> 8) & 0xFF;
        int blue = argb & 0xFF;
        return !(red >= WHITE_THRESHOLD && green >= WHITE_THRESHOLD && blue >= WHITE_THRESHOLD);
    }

    private static BufferedImage renderOnCanvas(BufferedImage content, int canvasWidth, int canvasHeight) {
        double scale = (double) Math.max(canvasWidth, canvasHeight)
                / Math.max(content.getWidth(), content.getHeight());
        int drawWidth = Math.max(1, (int) Math.round(content.getWidth() * scale));
        int drawHeight = Math.max(1, (int) Math.round(content.getHeight() * scale));
        int offsetX = (canvasWidth - drawWidth) / 2;
        int offsetY = (canvasHeight - drawHeight) / 2;

        BufferedImage canvas = new BufferedImage(canvasWidth, canvasHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = canvas.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setComposite(AlphaComposite.Src);
        g.drawImage(content, offsetX, offsetY, drawWidth, drawHeight, null);
        g.dispose();
        return canvas;
    }

    private static byte[] writePng(BufferedImage image) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        if (!ImageIO.write(image, "png", out)) {
            throw new IOException("Failed to encode normalized brand logo as PNG");
        }
        return out.toByteArray();
    }
}
