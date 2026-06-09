package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.ScaleDto;
import com.zjusthow.minicollections.service.ScaleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ScaleControllerTest {

    @Mock ScaleService scaleService;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ScaleController(scaleService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void listScales_returnsAllScales() throws Exception {
        when(scaleService.listAll()).thenReturn(List.of(
                new ScaleDto(1L, "1:64", 64),
                new ScaleDto(2L, "1:43", 43)));

        mockMvc.perform(get("/scales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("1:64"))
                .andExpect(jsonPath("$[1].code").value("1:43"));
    }
}
