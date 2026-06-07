package com.zjusthow.minicollections.image;

import com.zjusthow.minicollections.config.S3Properties;
import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.storage.BrandStorageKeys;
import com.zjusthow.minicollections.storage.StoredObjectUrls;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.Arrays;
import java.util.Locale;
import java.util.Objects;

@Service
@ConditionalOnBean(S3Client.class)
public class BrandLogoNormalizationService {

    private static final Logger log = LoggerFactory.getLogger(BrandLogoNormalizationService.class);

    private final BrandRepository brandRepository;
    private final S3Client s3Client;
    private final S3Properties s3Properties;

    public BrandLogoNormalizationService(
            BrandRepository brandRepository,
            S3Client s3Client,
            S3Properties s3Properties) {
        this.brandRepository = brandRepository;
        this.s3Client = s3Client;
        this.s3Properties = s3Properties;
    }

    public BrandLogoNormalizationReport normalizeAll() {
        BrandLogoNormalizationReport report = new BrandLogoNormalizationReport();
        for (BrandEntity brand : brandRepository.findAll()) {
            normalizeBrand(brand, report);
        }
        return report;
    }

    private void normalizeBrand(BrandEntity brand, BrandLogoNormalizationReport report) {
        String label = brand.nameEn();
        if (brand.imageUrl() == null || brand.imageUrl().isBlank()) {
            report.recordSkippedNoImage(brand.id(), label);
            return;
        }

        var key = StoredObjectUrls.objectKeyFromPublicUrl(s3Properties.publicBaseUrl(), brand.imageUrl());
        if (key.isEmpty()) {
            report.recordSkippedExternal(brand.id(), label);
            return;
        }

        String contentType = contentTypeForKey(key.get());
        if ("image/svg+xml".equals(contentType)) {
            report.recordSkippedSvg(brand.id(), label);
            return;
        }

        try {
            byte[] original = downloadObject(key.get());
            NormalizedBrandLogo normalized = BrandLogoNormalizer.normalize(original, contentType);
            String newKey = BrandStorageKeys.logoObjectKey(
                    brand.id(), brand.nameEn(), extensionForContentType(normalized.contentType()));
            String newUrl = publicUrl(newKey);

            if (Arrays.equals(original, normalized.bytes())
                    && Objects.equals(key.get(), newKey)
                    && Objects.equals(brand.imageUrl(), newUrl)) {
                report.recordUnchanged(brand.id(), label);
                return;
            }

            putObject(newKey, normalized.contentType(), normalized.bytes());
            if (!newKey.equals(key.get())) {
                deleteObjectQuietly(key.get());
            }
            if (!Objects.equals(brand.imageUrl(), newUrl)) {
                brandRepository.updateImageUrl(brand.id(), newUrl);
            }
            report.recordUpdated(brand.id(), label);
        } catch (IOException e) {
            report.recordFailed(brand.id(), label, e.getMessage());
            log.warn("Failed to normalize brand {} logo: {}", brand.id(), e.getMessage());
        } catch (S3Exception e) {
            report.recordFailed(brand.id(), label, e.getMessage());
            log.warn("S3 error normalizing brand {} logo: {}", brand.id(), e.getMessage());
        }
    }

    private byte[] downloadObject(String key) {
        return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(key)
                .build()).asByteArray();
    }

    private void putObject(String key, String contentType, byte[] bytes) {
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(s3Properties.bucket())
                        .key(key)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(bytes));
    }

    private void deleteObjectQuietly(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(s3Properties.bucket())
                    .key(key)
                    .build());
        } catch (S3Exception e) {
            log.warn("Failed to delete replaced logo {}: {}", key, e.getMessage());
        }
    }

    private String publicUrl(String key) {
        String base = s3Properties.publicBaseUrl().replaceAll("/+$", "");
        return base + "/" + key;
    }

    private static String contentTypeForKey(String key) {
        String lower = key.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".svg")) {
            return "image/svg+xml";
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        return "application/octet-stream";
    }

    private static String extensionForContentType(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "image/svg+xml" -> ".svg";
            default -> ".png";
        };
    }
}
