package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.JwtService;
import com.zjusthow.minicollections.service.UserService;
import com.zjusthow.minicollections.service.WechatService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class WechatAuthControllerTest {

    @Mock WechatService wechatService;
    @Mock UserService userService;
    @Mock JwtService jwtService;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new WechatAuthController(wechatService, userService, jwtService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAuthUrl_returnsUrlAndState() throws Exception {
        when(wechatService.generateAuthUrl("pc"))
                .thenReturn(new WechatService.WechatUrlResult("https://wx.example/auth", "state-1"));

        mockMvc.perform(get("/auth/wechat/url").param("platform", "pc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://wx.example/auth"))
                .andExpect(jsonPath("$.state").value("state-1"));
    }

    @Test
    void exchange_returnsJwtToken() throws Exception {
        WechatService.WechatUserInfo info =
                new WechatService.WechatUserInfo("openid-1", "union-1", "Nick", "avatar.png");
        when(wechatService.exchangeCode("code-1", "state-1")).thenReturn(info);
        when(userService.findOrCreateWechatUser("openid-1", "union-1", "Nick", "avatar.png"))
                .thenReturn(42L);
        when(jwtService.generate("42")).thenReturn("jwt-token");

        mockMvc.perform(post("/auth/wechat/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"code-1\",\"state\":\"state-1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void bind_linksWechatToCurrentUser() throws Exception {
        WechatService.WechatUserInfo info =
                new WechatService.WechatUserInfo("openid-2", null, "Nick", null);
        UserProfileDto profile = new UserProfileDto(
                5L, null, null, "Alice", "en-US", null, false, true);
        when(wechatService.exchangeCode("code-2", "state-2")).thenReturn(info);
        when(userService.bindWechat(5L, info)).thenReturn(profile);

        mockMvc.perform(post("/auth/wechat/bind")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"code-2\",\"state\":\"state-2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.wechatBound").value(true));

        verify(userService).bindWechat(eq(5L), eq(info));
    }

    private static RequestPostProcessor authenticatedUser(String userId) {
        UserDetails user = org.springframework.security.core.userdetails.User
                .withUsername(userId)
                .password("n/a")
                .roles("USER")
                .build();
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        return request -> {
            SecurityContextHolder.getContext().setAuthentication(authentication);
            request.setUserPrincipal(authentication);
            return request;
        };
    }
}
