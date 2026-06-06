package com.zjusthow.minicollections.storage;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StoredObjectUrlsTest {

  private static final String BASE = "http://localhost:9000/minicollections-media";

  @Test
  void resolvesKeyFromFullUrl() {
    String url = BASE + "/42/a1b2c3d4-e5f6-4789-abcd-ef0123456789.png";
    assertEquals(
        "42/a1b2c3d4-e5f6-4789-abcd-ef0123456789.png",
        StoredObjectUrls.objectKeyFromPublicUrl(BASE, url).orElseThrow());
  }

  @Test
  void stripsQueryString() {
    String url = BASE + "/1/uuid.jpg?X-Amz-Algorithm=AWS4";
    assertEquals("1/uuid.jpg", StoredObjectUrls.objectKeyFromPublicUrl(BASE, url).orElseThrow());
  }

  @Test
  void resolvesKeyFromSamePathDifferentHost() {
    String url = BASE + "/42/a1b2c3d4-e5f6-4789-abcd-ef0123456789.png";
    assertEquals(
        "42/a1b2c3d4-e5f6-4789-abcd-ef0123456789.png",
        StoredObjectUrls.objectKeyFromPublicUrl("http://minio:9000/minicollections-media", url).orElseThrow());
  }

  @Test
  void emptyForForeignUrl() {
    assertTrue(StoredObjectUrls.objectKeyFromPublicUrl(BASE, "https://cdn.example.com/x.jpg").isEmpty());
  }
}
