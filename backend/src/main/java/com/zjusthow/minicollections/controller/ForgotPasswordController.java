package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.ForgotPasswordResetBody;
import com.zjusthow.minicollections.model.ForgotPasswordSendCodeRequest;
import com.zjusthow.minicollections.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ForgotPasswordController {

    private final UserService userService;

    public ForgotPasswordController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/forgot-password/send-code")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendCode(@RequestBody @Valid ForgotPasswordSendCodeRequest req) {
        userService.sendPasswordResetCode(req.target(), req.type());
    }

    @PostMapping("/forgot-password/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reset(@RequestBody @Valid ForgotPasswordResetBody body) {
        userService.resetPassword(body.email(), body.phone(), body.code(), body.newPassword());
    }
}
