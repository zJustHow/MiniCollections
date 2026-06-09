package com.zjusthow.minicollections.config;

import org.apache.http.Header;
import org.apache.http.HttpRequest;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.HttpResponseInterceptor;
import org.apache.http.protocol.HttpContext;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.boot.autoconfigure.elasticsearch.RestClientBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * AWS OpenSearch 2.x rejects Elasticsearch 8 client's {@code compatible-with=8} media type.
 * Rewrite outgoing request headers in prod only; local dev keeps the default ES 8 client.
 */
@Configuration
@Profile("prod")
public class OpenSearchRestClientConfiguration {

    @Bean
    RestClientBuilderCustomizer openSearchRestClientCustomizer() {
        return new RestClientBuilderCustomizer() {
            @Override
            public void customize(RestClientBuilder builder) {
                // RestClientBuilder has no header hooks; use HttpAsyncClientBuilder below.
            }

            @Override
            public void customize(org.apache.http.impl.nio.client.HttpAsyncClientBuilder builder) {
                builder
                        .addInterceptorFirst((HttpRequestInterceptor) OpenSearchRestClientConfiguration::normalizeCompatibilityHeaders)
                        .addInterceptorLast((HttpResponseInterceptor) (response, context) ->
                                response.addHeader("X-Elastic-Product", "Elasticsearch"));
            }
        };
    }

    private static void normalizeCompatibilityHeaders(HttpRequest request, HttpContext context) {
        replaceCompatibleHeader(request, "Content-Type", "application/json");
        replaceCompatibleHeader(request, "Accept", "application/json");
    }

    private static void replaceCompatibleHeader(HttpRequest request, String name, String replacement) {
        Header header = request.getFirstHeader(name);
        if (header != null && header.getValue().contains("compatible-with")) {
            request.removeHeaders(name);
            request.addHeader(name, replacement);
        }
    }
}
