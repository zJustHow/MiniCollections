package com.zjusthow.minicollections.image;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BrandLogoNormalizerTest {

    @Test
    void trimsTransparentPaddingAndPreservesCanvasSize() throws IOException {
        int canvasSize = 200;
        byte[] input = png(g -> {
            g.setColor(new Color(0, 0, 0, 0));
            g.fillRect(0, 0, canvasSize, canvasSize);
            g.setColor(Color.RED);
            g.fillRect(60, 80, 40, 20);
        }, canvasSize, canvasSize);

        NormalizedBrandLogo result = BrandLogoNormalizer.normalize(input, "image/png");

        assertEquals("image/png", result.contentType());
        BufferedImage output = ImageIO.read(new ByteArrayInputStream(result.bytes()));
        assertNotNull(output);
        assertEquals(canvasSize, output.getWidth());
        assertEquals(canvasSize, output.getHeight());

        assertTrue(Math.abs(contentWidth(output) - canvasSize) <= 2);
        assertTrue(Math.abs(horizontalCenter(output) - canvasSize / 2) <= 2);
    }

    @Test
    void trimsWhiteBordersFromOpaqueImages() throws IOException {
        byte[] input = png(g -> {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, 160, 160);
            g.setColor(Color.BLUE);
            g.fillRect(50, 70, 30, 20);
        }, 160, 160);

        NormalizedBrandLogo result = BrandLogoNormalizer.normalize(input, "image/jpeg");

        assertEquals("image/png", result.contentType());
        BufferedImage output = ImageIO.read(new ByteArrayInputStream(result.bytes()));
        assertEquals(160, output.getWidth());
        assertEquals(160, output.getHeight());
        assertEquals(0, output.getRGB(0, 0) >>> 24);
        assertTrue(contentWidth(output) > 0);
    }

    @Test
    void leavesSvgUnchanged() throws IOException {
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\"/>"
                .getBytes(StandardCharsets.UTF_8);

        NormalizedBrandLogo result = BrandLogoNormalizer.normalize(svg, "image/svg+xml");

        assertEquals("image/svg+xml", result.contentType());
        assertArrayEquals(svg, result.bytes());
    }

    @Test
    void convertsEdgeConnectedWhiteBackgroundToTransparency() throws IOException {
        byte[] input = png(g -> {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, 120, 120);
            g.setColor(Color.BLUE);
            g.fillRect(40, 50, 40, 20);
        }, 120, 120);

        NormalizedBrandLogo result = BrandLogoNormalizer.normalize(input, "image/png");
        BufferedImage output = ImageIO.read(new ByteArrayInputStream(result.bytes()));

        assertEquals(0, output.getRGB(0, 0) >>> 24);
        assertEquals(0, output.getRGB(119, 119) >>> 24);
        assertTrue((output.getRGB(60, 60) >>> 24) >= 16);
    }

    @Test
    void removeEdgeConnectedBackground_clearsWhiteBorderButKeepsInteriorMark() {
        BufferedImage image = new BufferedImage(60, 60, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 60, 60);
        g.setColor(Color.BLACK);
        g.fillRect(20, 20, 20, 20);
        g.setColor(Color.WHITE);
        g.fillRect(26, 24, 8, 12);
        g.dispose();

        BrandLogoNormalizer.removeEdgeConnectedBackground(image);

        assertEquals(0, image.getRGB(0, 0) >>> 24);
        assertTrue((image.getRGB(30, 30) & 0xFF) >= 250);
    }

    @Test
    void removeEdgeConnectedBackground_clearsBlackBorder() throws IOException {
        byte[] input = png(g -> {
            g.setColor(Color.BLACK);
            g.fillRect(0, 0, 120, 120);
            g.setColor(new Color(196, 164, 108));
            g.fillRect(30, 40, 60, 40);
        }, 120, 120);

        NormalizedBrandLogo result = BrandLogoNormalizer.normalize(input, "image/png");
        BufferedImage output = ImageIO.read(new ByteArrayInputStream(result.bytes()));

        assertEquals(0, output.getRGB(0, 0) >>> 24);
        assertTrue((output.getRGB(60, 60) >>> 24) >= 16);
    }

    @Test
    void findContentBounds_ignoresTransparentMargins() {
        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        g.setColor(new Color(0, 0, 0, 0));
        g.fillRect(0, 0, 100, 100);
        g.setColor(Color.GREEN);
        g.fillRect(20, 30, 10, 10);
        g.dispose();

        var bounds = BrandLogoNormalizer.findContentBounds(image);

        assertNotNull(bounds);
        assertEquals(20, bounds.x);
        assertEquals(30, bounds.y);
        assertEquals(10, bounds.width);
        assertEquals(10, bounds.height);
    }

    private static int contentWidth(BufferedImage image) {
        int minX = image.getWidth();
        int maxX = -1;
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                if (((image.getRGB(x, y) >> 24) & 0xFF) >= 16) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                }
            }
        }
        return maxX >= minX ? maxX - minX + 1 : 0;
    }

    private static int horizontalCenter(BufferedImage image) {
        int minX = image.getWidth();
        int maxX = -1;
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                if (((image.getRGB(x, y) >> 24) & 0xFF) >= 16) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                }
            }
        }
        return (minX + maxX) / 2;
    }

    private static byte[] png(PngPainter painter, int width, int height) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        painter.paint(g);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    @FunctionalInterface
    private interface PngPainter {
        void paint(Graphics2D g);
    }
}
