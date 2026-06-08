package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.model.ApprovalBody;
import com.zjusthow.minicollections.model.ObjectSubmissionDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.RejectionBody;
import com.zjusthow.minicollections.model.SubmissionStatusCounts;
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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock SubmissionService submissionService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminController(submissionService))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void submissionCounts_returnsAggregates() throws Exception {
        when(submissionService.getStatusCounts())
                .thenReturn(new SubmissionStatusCounts(3, 10, 2, 15));

        mockMvc.perform(get("/admin/submissions/counts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pending").value(3))
                .andExpect(jsonPath("$.approved").value(10))
                .andExpect(jsonPath("$.rejected").value(2))
                .andExpect(jsonPath("$.total").value(15));
    }

    @Test
    void listSubmissions_passesStatusAndPaging() throws Exception {
        when(submissionService.listByStatusPage("PENDING", 1, 24))
                .thenReturn(PageResponse.of(List.of(), 1, 24, 0, true));

        mockMvc.perform(get("/admin/submissions")
                        .param("status", "PENDING")
                        .param("page", "1")
                        .param("size", "24"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1));

        verify(submissionService).listByStatusPage("PENDING", 1, 24);
    }

    @Test
    void approve_delegatesToServiceWithAdminId() throws Exception {
        ObjectSubmissionDto dto = sampleDto("APPROVED");
        when(submissionService.approve(eq(5L), eq(42L), any(ApprovalBody.class)))
                .thenReturn(dto);

        ApprovalBody body = new ApprovalBody(
                "Model", null, null, null, null, null, null,
                1L, null, null, null, "ok");

        mockMvc.perform(post("/admin/submissions/5/approve")
                        .with(authenticatedAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        verify(submissionService).approve(eq(5L), eq(42L), any(ApprovalBody.class));
    }

    @Test
    void reject_allowsMissingBody() throws Exception {
        ObjectSubmissionDto dto = sampleDto("REJECTED");
        when(submissionService.reject(eq(6L), eq(42L), isNull())).thenReturn(dto);

        mockMvc.perform(post("/admin/submissions/6/reject")
                        .with(authenticatedAdmin())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void reject_passesReasonFromBody() throws Exception {
        ObjectSubmissionDto dto = sampleDto("REJECTED");
        when(submissionService.reject(eq(6L), eq(42L), eq("duplicate"))).thenReturn(dto);

        RejectionBody body = new RejectionBody("duplicate");

        mockMvc.perform(post("/admin/submissions/6/reject")
                        .with(authenticatedAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());

        verify(submissionService).reject(6L, 42L, "duplicate");
    }

    private static RequestPostProcessor authenticatedAdmin() {
        UsernamePasswordAuthenticationToken authentication = adminPrincipal();
        return request -> {
            SecurityContextHolder.getContext().setAuthentication(authentication);
            request.setUserPrincipal(authentication);
            return request;
        };
    }

    private static UsernamePasswordAuthenticationToken adminPrincipal() {
        UserDetails admin = org.springframework.security.core.userdetails.User
                .withUsername("42")
                .password("n/a")
                .roles("ADMIN")
                .build();
        return new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
    }

    private static ObjectSubmissionDto sampleDto(String status) {
        return new ObjectSubmissionDto(
                1L, 2L, "Alice", "FEEDBACK", "Name", null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, "notes", status,
                OffsetDateTime.now(), null, null);
    }
}
