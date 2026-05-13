package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.config.S3Properties;
import com.zjusthow.minicollections.exception.UnsupportedImageTypeException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.PutBucketPolicyRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnBean(S3Client.class)
public class ImageStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

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
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new UnsupportedImageTypeException(contentType);
        }
        String ext = extensionForContentType(contentType);
        String key = userId + "/" + UUID.randomUUID() + ext;
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(key)
                .contentType(contentType)
                .build();
        s3Client.putObject(put, RequestBody.fromBytes(file.getBytes()));
        String base = s3Properties.publicBaseUrl().replaceAll("/+$", "");
        return base + "/" + key;
    }

    private static String extensionForContentType(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
    }
}
