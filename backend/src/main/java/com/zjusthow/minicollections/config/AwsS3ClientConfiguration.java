package com.zjusthow.minicollections.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
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
        AwsBasicCredentials creds = AwsBasicCredentials.create(
                props.accessKey() != null ? props.accessKey() : "",
                props.secretKey() != null ? props.secretKey() : "");
        builder.credentialsProvider(StaticCredentialsProvider.create(creds));
        String endpoint = props.endpoint();
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build());
        }
        return builder.build();
    }
}
