package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.model.ObjectSubmissionDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.SubmissionBody;
import com.zjusthow.minicollections.service.SubmissionService;
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
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SubmissionControllerTest {

    @Mock SubmissionService submissionService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new SubmissionController(submissionService))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getMySubmissions_returnsPagedResults() throws Exception {
        when(submissionService.listByUserPage(5L, 0, 24))
                .thenReturn(PageResponse.of(List.of(sampleDto()), 0, 24, 1, true));

        mockMvc.perform(get("/submissions/mine")
                        .with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].status").value("PENDING"));
    }

    @Test
    void submit_createsSubmission() throws Exception {
        when(submissionService.submit(eq(5L), org.mockito.ArgumentMatchers.any(SubmissionBody.class)))
                .thenReturn(sampleDto());

        SubmissionBody body = new SubmissionBody(
                "FEEDBACK", "Name", null, null, null, null, null,
                null, null, null, null, null, "notes");

        mockMvc.perform(post("/submissions")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getMySubmissions_passesPageAndSizeParams() throws Exception {
        when(submissionService.listByUserPage(5L, 2, 12))
                .thenReturn(PageResponse.of(List.of(sampleDto()), 2, 12, 1, true));

        mockMvc.perform(get("/submissions/mine")
                        .param("page", "2")
                        .param("size", "12")
                        .with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(2));

        verify(submissionService).listByUserPage(5L, 2, 12);
    }

    @Test
    void deleteMySubmission_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/submissions/9")
                        .with(authenticatedUser("5")))
                .andExpect(status().isNoContent());

        verify(submissionService).deleteByUser(5L, 9L);
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

    private static ObjectSubmissionDto sampleDto() {
        return new ObjectSubmissionDto(
                1L, 5L, "Alice", "FEEDBACK", "Name", null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, "notes", "PENDING",
                OffsetDateTime.now(), null, null);
    }
}
