package com.zjusthow.minicollections.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ViewCountFlushJob {

    private static final Logger log = LoggerFactory.getLogger(ViewCountFlushJob.class);

    private final ViewCountService viewCountService;

    public ViewCountFlushJob(ViewCountService viewCountService) {
        this.viewCountService = viewCountService;
    }

    @Scheduled(fixedDelayString = "${app.view-count.flush-interval-ms:120000}")
    public void flushPendingViewCounts() {
        try {
            viewCountService.flushPendingCounts();
        } catch (Exception e) {
            log.warn("Failed to flush pending view counts: {}", e.getMessage());
        }
    }
}
