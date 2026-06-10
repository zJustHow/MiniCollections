package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.model.RegisterBody;
import com.zjusthow.minicollections.model.SendCodeRequest;
import com.zjusthow.minicollections.service.UserService;
import com.zjusthow.minicollections.service.VerificationService;
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
class UserControllerTest {

    @Mock UserService userService;
    @Mock VerificationService verificationService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new UserController(userService, verificationService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void sendCode_delegatesToVerificationService() throws Exception {
        SendCodeRequest body = new SendCodeRequest("alice@example.com", "email");

        mockMvc.perform(post("/send-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNoContent());

        verify(verificationService).sendCode("alice@example.com", "email");
    }

    @Test
    void sendCode_delegatesPhoneTargetToVerificationService() throws Exception {
        SendCodeRequest body = new SendCodeRequest("+8613800138000", "phone");

        mockMvc.perform(post("/send-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNoContent());

        verify(verificationService).sendCode("+8613800138000", "phone");
    }

    @Test
    void signUp_verifiesCodeThenCreatesUser() throws Exception {
        RegisterBody body = new RegisterBody(
                "alice@example.com", null, "secret12", "Alice", "en-US", "123456");

        mockMvc.perform(post("/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());

        verify(verificationService).verify("alice@example.com", "123456");
        verify(userService).signUp("alice@example.com", null, "secret12", "Alice", "en-US");
    }

    @Test
    void signUp_usesPhoneWhenEmailBlank() throws Exception {
        RegisterBody body = new RegisterBody(
                null, "+8613800138000", "secret12", "Bob", null, "654321");

        mockMvc.perform(post("/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());

        verify(verificationService).verify("+8613800138000", "654321");
        verify(userService).signUp(null, "+8613800138000", "secret12", "Bob", null);
    }
}
