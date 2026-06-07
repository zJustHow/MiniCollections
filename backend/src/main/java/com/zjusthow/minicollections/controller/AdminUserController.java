package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/lookup")
    public UserProfileDto lookupByEmail(@RequestParam String email) {
        return userService.getProfileByEmail(email);
    }

    @PostMapping("/{id}/grant-admin")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grantAdmin(@PathVariable Long id) {
        userService.grantAdminRole(id);
    }

    @PostMapping("/{id}/revoke-admin")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeAdmin(@PathVariable Long id) {
        userService.revokeAdminRole(id);
    }
}
