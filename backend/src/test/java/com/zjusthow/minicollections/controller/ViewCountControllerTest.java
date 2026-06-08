package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.service.ViewCountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ViewCountControllerTest {

    @Mock ViewCountService viewCountService;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ViewCountController(viewCountService))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void recordBrandView_acceptsAnonymousSession() throws Exception {
        mockMvc.perform(post("/brands/3/views")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"anon-1\"}"))
                .andExpect(status().isNoContent());

        verify(viewCountService).recordBrandView(3L, null, "anon-1");
    }

    @Test
    void recordModelView_acceptsEmptyBody() throws Exception {
        mockMvc.perform(post("/brands/objects/8/views")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(viewCountService).recordModelView(8L, null, null);
    }
}
