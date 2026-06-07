package com.zjusthow.minicollections.image;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("normalize-brand-logos")
public class BrandLogoNormalizationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BrandLogoNormalizationRunner.class);

    private final BrandLogoNormalizationService normalizationService;
    private final ApplicationContext applicationContext;

    public BrandLogoNormalizationRunner(
            BrandLogoNormalizationService normalizationService,
            ApplicationContext applicationContext) {
        this.normalizationService = normalizationService;
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(ApplicationArguments args) {
        BrandLogoNormalizationReport report = normalizationService.normalizeAll();
        log.info("Brand logo normalization finished: {}", report);
        for (String detail : report.details()) {
            log.info("  {}", detail);
        }
        int exitCode = report.failed() > 0 ? 1 : 0;
        System.exit(SpringApplication.exit(applicationContext, () -> exitCode));
    }
}
