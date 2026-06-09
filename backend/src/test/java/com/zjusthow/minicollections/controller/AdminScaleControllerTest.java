package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.model.ScaleBody;
import com.zjusthow.minicollections.model.ScaleDto;
import com.zjusthow.minicollections.service.ScaleService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminScaleControllerTest {

    @Mock ScaleService scaleService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminScaleController(scaleService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void createScale_returnsCreated() throws Exception {
        ScaleBody body = new ScaleBody("1:72", 72);
        ScaleDto created = new ScaleDto(72L, "1:72", 72);
        when(scaleService.create(body)).thenReturn(created);

        mockMvc.perform(post("/admin/scales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("1:72"));
    }

    @Test
    void updateScale_returnsUpdated() throws Exception {
        ScaleBody body = new ScaleBody("1:72", 72);
        ScaleDto updated = new ScaleDto(72L, "1:72", 72);
        when(scaleService.update(72L, body)).thenReturn(updated);

        mockMvc.perform(put("/admin/scales/72")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1:72"));
    }

    @Test
    void deleteScale_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/admin/scales/72"))
                .andExpect(status().isNoContent());

        verify(scaleService).delete(72L);
    }
}
