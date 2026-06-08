package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.model.ForgotPasswordResetBody;
import com.zjusthow.minicollections.model.ForgotPasswordSendCodeRequest;
import com.zjusthow.minicollections.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ForgotPasswordControllerTest {

    @Mock UserService userService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ForgotPasswordController(userService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void sendCode_delegatesToUserService() throws Exception {
        ForgotPasswordSendCodeRequest body =
                new ForgotPasswordSendCodeRequest("alice@example.com", "email");

        mockMvc.perform(post("/forgot-password/send-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNoContent());

        verify(userService).sendPasswordResetCode("alice@example.com", "email");
    }

    @Test
    void reset_delegatesToUserService() throws Exception {
        ForgotPasswordResetBody body =
                new ForgotPasswordResetBody("alice@example.com", null, "123456", "newpass1");

        mockMvc.perform(post("/forgot-password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNoContent());

        verify(userService).resetPassword("alice@example.com", null, "123456", "newpass1");
    }
}
