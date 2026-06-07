package com.zjusthow.minicollections.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnResource;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Serves the Vite SPA shell for browser navigations (Accept: text/html) while
 * leaving JSON API requests on the same paths unchanged.
 */
@Component
@ConditionalOnResource(resources = "classpath:/public/index.html")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SpaForwardFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (shouldForwardToSpa(request)) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private static boolean shouldForwardToSpa(HttpServletRequest request) {
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            return false;
        }

        String accept = request.getHeader("Accept");
        if (accept == null || !accept.contains("text/html")) {
            return false;
        }

        String path = request.getRequestURI();
        if (path == null || path.isEmpty() || "/".equals(path) || "/index.html".equals(path)) {
            return false;
        }

        return !isStaticAssetPath(path);
    }

    private static boolean isStaticAssetPath(String path) {
        return path.startsWith("/assets/")
                || path.startsWith("/static/")
                || path.startsWith("/images/")
                || path.endsWith(".js")
                || path.endsWith(".css")
                || path.endsWith(".json")
                || path.endsWith(".png")
                || path.endsWith(".jpg")
                || path.endsWith(".jpeg")
                || path.endsWith(".gif")
                || path.endsWith(".webp")
                || path.endsWith(".svg")
                || path.endsWith(".ico")
                || path.endsWith(".txt")
                || path.endsWith(".map")
                || path.endsWith(".woff")
                || path.endsWith(".woff2");
    }
}
