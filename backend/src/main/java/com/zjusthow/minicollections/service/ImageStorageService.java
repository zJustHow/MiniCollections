package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.config.S3Properties;
import com.zjusthow.minicollections.exception.UnsupportedImageTypeException;
import com.zjusthow.minicollections.storage.BrandStorageKeys;
import com.zjusthow.minicollections.storage.StoredObjectUrls;
import com.zjusthow.minicollections.storage.UserStorageKeys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.PutBucketPolicyRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnBean(S3Client.class)
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml");

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    public ImageStorageService(S3Client s3Client, S3Properties s3Properties) {
        this.s3Client = s3Client;
        this.s3Properties = s3Properties;
        ensureBucket();
    }

    private void ensureBucket() {
        String bucket = s3Properties.bucket();
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            }
        }
        String policy = """
                {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
                """.formatted(bucket).strip();
        s3Client.putBucketPolicy(PutBucketPolicyRequest.builder().bucket(bucket).policy(policy).build());
    }

    public String uploadUserImage(long userId, MultipartFile file) throws IOException {
        String contentType = resolveContentType(file);
        String ext = extensionForContentType(contentType);
        String key = userId + "/" + UUID.randomUUID() + ext;
        return putObject(key, contentType, file.getBytes());
    }

    /**
     * Upload or replace a brand logo at a stable key, e.g. {@code brands/minigt/logo.svg}.
     */
    public String uploadBrandAsset(long brandId, String brandNameEn, MultipartFile file) throws IOException {
        String contentType = resolveContentType(file);
        String ext = extensionForContentType(contentType);
        String key = BrandStorageKeys.logoObjectKey(brandId, brandNameEn, ext);
        return putObject(key, contentType, file.getBytes());
    }

    /**
     * Deletes a user-uploaded object when {@code imageUrl} points at this bucket and key is {@code userId}/{uuid}.ext.
     * Ignores brand assets, static URLs, and URLs owned by other users.
     */
    public void deleteUserImageIfOwned(long userId, String imageUrl) {
        StoredObjectUrls.objectKeyFromPublicUrl(s3Properties.publicBaseUrl(), imageUrl)
                .filter(key -> UserStorageKeys.isOwnedByUser(userId, key))
                .ifPresent(this::deleteObjectQuietly);
    }

    public void deleteReplacedUserImage(long userId, String previousUrl, String newUrl) {
        if (previousUrl == null || previousUrl.isBlank() || Objects.equals(previousUrl, newUrl)) {
            return;
        }
        deleteUserImageIfOwned(userId, previousUrl);
    }

    private void deleteObjectQuietly(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(s3Properties.bucket())
                    .key(key)
                    .build());
        } catch (S3Exception e) {
            log.warn("Failed to delete S3 object {}: {}", key, e.getMessage());
        }
    }

    private String putObject(String key, String contentType, byte[] bytes) {
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(key)
                .contentType(contentType)
                .build();
        s3Client.putObject(put, RequestBody.fromBytes(bytes));
        String base = s3Properties.publicBaseUrl().replaceAll("/+$", "");
        return base + "/" + key;
    }

    private static String resolveContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            String normalized = contentType.toLowerCase(Locale.ROOT);
            if (ALLOWED_TYPES.contains(normalized)) {
                return normalized;
            }
        }
        String filename = file.getOriginalFilename();
        if (filename != null) {
            String lower = filename.toLowerCase(Locale.ROOT);
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
        }
        throw new UnsupportedImageTypeException(contentType);
    }

    private static String extensionForContentType(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "image/svg+xml" -> ".svg";
            default -> "";
        };
    }
}
