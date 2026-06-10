package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.UserProfileDto;
import com.zjusthow.minicollections.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    @Mock UserService userService;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminUserController(userService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void lookupByEmail_returnsProfile() throws Exception {
        UserProfileDto profile = new UserProfileDto(
                3L, "alice@example.com", null, "Alice", "en-US", null, false, false, true);
        when(userService.getProfileByEmail("alice@example.com")).thenReturn(profile);

        mockMvc.perform(get("/admin/users/lookup").param("email", "alice@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Alice"));
    }

    @Test
    void grantAdmin_delegatesToUserService() throws Exception {
        mockMvc.perform(post("/admin/users/3/grant-admin"))
                .andExpect(status().isNoContent());

        verify(userService).grantAdminRole(3L);
    }

    @Test
    void revokeAdmin_delegatesToUserService() throws Exception {
        mockMvc.perform(post("/admin/users/3/revoke-admin"))
                .andExpect(status().isNoContent());

        verify(userService).revokeAdminRole(3L);
    }
}
