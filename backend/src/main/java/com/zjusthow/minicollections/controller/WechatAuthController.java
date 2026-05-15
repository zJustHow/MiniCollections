package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.JwtService;
import com.zjusthow.minicollections.service.UserService;
import com.zjusthow.minicollections.service.WechatService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/wechat")
public class WechatAuthController {

    private final WechatService wechatService;
    private final UserService userService;
    private final JwtService jwtService;

    public WechatAuthController(WechatService wechatService, UserService userService, JwtService jwtService) {
        this.wechatService = wechatService;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/url")
    public Map<String, String> getAuthUrl(@RequestParam(defaultValue = "pc") String platform) {
        WechatService.WechatUrlResult result = wechatService.generateAuthUrl(platform);
        return Map.of("url", result.url(), "state", result.state());
    }

    @PostMapping("/exchange")
    public Map<String, String> exchange(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String state = body.get("state");
        WechatService.WechatUserInfo info = wechatService.exchangeCode(code, state);
        Long userId = userService.findOrCreateWechatUser(
                info.openid(), info.unionid(), info.nickname(), info.headimgurl());
        String token = jwtService.generate(String.valueOf(userId));
        return Map.of("token", token);
    }

    @PostMapping("/bind")
    public UserProfileDto bind(@RequestBody Map<String, String> body, Authentication authentication) {
        String code = body.get("code");
        String state = body.get("state");
        Long userId = Long.parseLong(authentication.getName());
        WechatService.WechatUserInfo info = wechatService.exchangeCode(code, state);
        return userService.bindWechat(userId, info);
    }
}
