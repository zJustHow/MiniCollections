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
import java.util.ArrayDeque;
import java.util.Locale;

/**
 * Normalizes brand logo uploads while preserving the original image dimensions.
 * Raster images convert edge-connected backgrounds (any solid color) to transparency,
 * trim margins, scale so the longest edge fills the canvas, and export as PNG.
 */
public final class BrandLogoNormalizer {

    private static final int ALPHA_THRESHOLD = 16;
    private static final int COLOR_TOLERANCE = 40;

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
        removeEdgeConnectedBackground(argb);
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

        int minX = width;
        int minY = height;
        int maxX = -1;
        int maxY = -1;

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (isContentPixel(image.getRGB(x, y))) {
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

    static boolean isContentPixel(int argb) {
        return ((argb >> 24) & 0xFF) >= ALPHA_THRESHOLD;
    }

    /**
     * Flood-fills pixels reachable from the border that match the detected background
     * color. Islands of logo artwork that do not touch the border are kept.
     */
    static void removeEdgeConnectedBackground(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        int background = detectBorderBackgroundColor(image);
        boolean[][] visited = new boolean[height][width];
        ArrayDeque<int[]> queue = new ArrayDeque<>();

        for (int x = 0; x < width; x++) {
            enqueueBackgroundPixel(image, background, visited, queue, x, 0);
            enqueueBackgroundPixel(image, background, visited, queue, x, height - 1);
        }
        for (int y = 0; y < height; y++) {
            enqueueBackgroundPixel(image, background, visited, queue, 0, y);
            enqueueBackgroundPixel(image, background, visited, queue, width - 1, y);
        }

        while (!queue.isEmpty()) {
            int[] point = queue.removeFirst();
            int x = point[0];
            int y = point[1];
            image.setRGB(x, y, 0);

            if (x > 0) {
                enqueueBackgroundPixel(image, background, visited, queue, x - 1, y);
            }
            if (x + 1 < width) {
                enqueueBackgroundPixel(image, background, visited, queue, x + 1, y);
            }
            if (y > 0) {
                enqueueBackgroundPixel(image, background, visited, queue, x, y - 1);
            }
            if (y + 1 < height) {
                enqueueBackgroundPixel(image, background, visited, queue, x, y + 1);
            }
        }
    }

    static int detectBorderBackgroundColor(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        int[] samples = {
                image.getRGB(0, 0),
                image.getRGB(width - 1, 0),
                image.getRGB(0, height - 1),
                image.getRGB(width - 1, height - 1),
                image.getRGB(width / 2, 0),
                image.getRGB(width / 2, height - 1),
                image.getRGB(0, height / 2),
                image.getRGB(width - 1, height / 2),
        };
        long red = 0;
        long green = 0;
        long blue = 0;
        for (int argb : samples) {
            red += (argb >> 16) & 0xFF;
            green += (argb >> 8) & 0xFF;
            blue += argb & 0xFF;
        }
        int count = samples.length;
        return (0xFF << 24)
                | (((int) (red / count)) << 16)
                | (((int) (green / count)) << 8)
                | ((int) (blue / count));
    }

    private static void enqueueBackgroundPixel(
            BufferedImage image,
            int background,
            boolean[][] visited,
            ArrayDeque<int[]> queue,
            int x,
            int y) {
        if (visited[y][x] || !matchesBackground(image.getRGB(x, y), background)) {
            return;
        }
        visited[y][x] = true;
        queue.addLast(new int[] {x, y});
    }

    static boolean matchesBackground(int argb, int background) {
        int alpha = (argb >> 24) & 0xFF;
        if (alpha < ALPHA_THRESHOLD) {
            return true;
        }
        int red = (argb >> 16) & 0xFF;
        int green = (argb >> 8) & 0xFF;
        int blue = argb & 0xFF;
        int bgRed = (background >> 16) & 0xFF;
        int bgGreen = (background >> 8) & 0xFF;
        int bgBlue = background & 0xFF;
        return Math.abs(red - bgRed) <= COLOR_TOLERANCE
                && Math.abs(green - bgGreen) <= COLOR_TOLERANCE
                && Math.abs(blue - bgBlue) <= COLOR_TOLERANCE;
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
