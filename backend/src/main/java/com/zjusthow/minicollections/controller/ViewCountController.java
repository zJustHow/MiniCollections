package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.ViewRecordBody;
import com.zjusthow.minicollections.service.ViewCountService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ViewCountController {

    private final ViewCountService viewCountService;

    public ViewCountController(ViewCountService viewCountService) {
        this.viewCountService = viewCountService;
    }

    @PostMapping("/brands/{brandId}/views")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recordBrandView(
            @PathVariable long brandId,
            @RequestBody(required = false) ViewRecordBody body,
            @AuthenticationPrincipal User user) {
        String sessionId = body != null ? body.sessionId() : null;
        viewCountService.recordBrandView(brandId, username(user), sessionId);
    }

    @PostMapping("/brands/objects/{objectId}/views")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recordModelView(
            @PathVariable long objectId,
            @RequestBody(required = false) ViewRecordBody body,
            @AuthenticationPrincipal User user) {
        String sessionId = body != null ? body.sessionId() : null;
        viewCountService.recordModelView(objectId, username(user), sessionId);
    }

    private static String username(User user) {
        return user != null ? user.getUsername() : null;
    }
}
