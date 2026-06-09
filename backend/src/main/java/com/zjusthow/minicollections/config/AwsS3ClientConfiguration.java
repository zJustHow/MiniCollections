package com.zjusthow.minicollections.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
@EnableConfigurationProperties(S3Properties.class)
public class AwsS3ClientConfiguration {

    @Bean
    @ConditionalOnProperty(name = "app.s3.enabled", havingValue = "true", matchIfMissing = true)
    public S3Client s3Client(S3Properties props) {
        var builder = S3Client.builder()
                .region(Region.of(props.region()));
        if (usesStaticCredentials(props)) {
            AwsBasicCredentials creds = AwsBasicCredentials.create(props.accessKey(), props.secretKey());
            builder.credentialsProvider(StaticCredentialsProvider.create(creds));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        if (usesPathStyleEndpoint(props.endpoint())) {
            builder.endpointOverride(URI.create(props.endpoint()))
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build());
        }
        return builder.build();
    }

    private static boolean usesStaticCredentials(S3Properties props) {
        return props.accessKey() != null
                && !props.accessKey().isBlank()
                && props.secretKey() != null
                && !props.secretKey().isBlank()
                && !"unused".equalsIgnoreCase(props.accessKey())
                && !"unused".equalsIgnoreCase(props.secretKey());
    }

    /** MinIO and other S3-compatible stores need a custom endpoint with path-style access. */
    private static boolean usesPathStyleEndpoint(String endpoint) {
        return endpoint != null
                && !endpoint.isBlank()
                && !endpoint.contains("amazonaws.com");
    }
}
