package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.RegisterBody;
import com.zjusthow.minicollections.model.SendCodeRequest;
import com.zjusthow.minicollections.service.UserService;
import com.zjusthow.minicollections.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class UserController {

    private final UserService userService;
    private final VerificationService verificationService;

    public UserController(UserService userService, VerificationService verificationService) {
        this.userService = userService;
        this.verificationService = verificationService;
    }

    @PostMapping("/send-code")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendCode(@RequestBody @Valid SendCodeRequest req) {
        verificationService.sendCode(req.target(), req.type());
    }

    @PostMapping("/signup")
    @ResponseStatus(value = HttpStatus.CREATED)
    public void signUp(@RequestBody @Valid RegisterBody body) {
        String target = (body.email() != null && !body.email().isBlank()) ? body.email() : body.phone();
        verificationService.verify(target, body.code());
        userService.signUp(body.email(), body.phone(), body.password(), body.name(), body.preferredLocale());
    }
}
