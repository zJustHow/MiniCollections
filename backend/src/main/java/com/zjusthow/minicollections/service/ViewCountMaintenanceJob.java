package com.zjusthow.minicollections.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ViewCountMaintenanceJob {

    private static final Logger log = LoggerFactory.getLogger(ViewCountMaintenanceJob.class);

    private final ViewCountService viewCountService;

    @Value("${app.view-count.event-retention-days:30}")
    private int eventRetentionDays;

    public ViewCountMaintenanceJob(ViewCountService viewCountService) {
        this.viewCountService = viewCountService;
    }

    @Scheduled(cron = "${app.view-count.purge-events-cron:0 0 4 * * ?}")
    public void purgeOldPageViewEvents() {
        try {
            long deleted = viewCountService.purgeEventsOlderThanDays(eventRetentionDays);
            if (deleted > 0) {
                log.info("Purged {} page view events older than {} days", deleted, eventRetentionDays);
            }
        } catch (Exception e) {
            log.warn("Failed to purge old page view events: {}", e.getMessage());
        }
    }
}
