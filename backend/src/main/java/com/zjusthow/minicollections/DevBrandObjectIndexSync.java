package com.zjusthow.minicollections;

import com.zjusthow.minicollections.elasticsearch.BrandObjectIndexService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

/**
 * Runs after {@link DevRunner} (ApplicationRunner) and default index bootstrap so seed SQL
 * changes are reflected in Elasticsearch on every local dev startup.
 */
@Component
@Profile("dev")
public class DevBrandObjectIndexSync {

    private static final Logger log = LoggerFactory.getLogger(DevBrandObjectIndexSync.class);

    private final BrandObjectIndexService brandObjectIndexService;

    public DevBrandObjectIndexSync(BrandObjectIndexService brandObjectIndexService) {
        this.brandObjectIndexService = brandObjectIndexService;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    public void rebuildAfterDevSeed() {
        if (!brandObjectIndexService.isEnabled()) {
            return;
        }
        log.info("Dev profile: rebuilding Elasticsearch brand-objects index after seed");
        brandObjectIndexService.rebuildAll();
    }
}
