package com.zjusthow.minicollections.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zjusthow.minicollections.model.GroupBody;
import com.zjusthow.minicollections.model.GroupCombinedSearchDto;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.UserObjectBody;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.service.GroupService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GroupControllerTest {

    @Mock GroupService groupService;

    MockMvc mockMvc;
    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new GroupController(groupService))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getGroups_returnsPagedGroups() throws Exception {
        GroupDto group = new GroupDto(1L, "Favorites", null);
        when(groupService.getGroupsPage(5L, 0, 48))
                .thenReturn(PageResponse.of(List.of(group), 0, 48, 1, true));

        mockMvc.perform(get("/groups").with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Favorites"));
    }

    @Test
    void createGroup_returnsCreated() throws Exception {
        GroupDto created = new GroupDto(2L, "New Group", null);
        when(groupService.createGroup(5L, "New Group", null)).thenReturn(created);

        GroupBody body = new GroupBody("New Group", null);

        mockMvc.perform(post("/groups")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Group"));

        verify(groupService).createGroup(5L, "New Group", null);
    }

    @Test
    void searchGroups_returnsCombinedResults() throws Exception {
        GroupCombinedSearchDto result = new GroupCombinedSearchDto(
                List.of(new GroupDto(1L, "Favorites", null)),
                List.of(),
                0, 48, 1L, 0L, 1L, 1, true);
        when(groupService.crossSearchPage(5L, "bmw", 0, 48)).thenReturn(result);

        mockMvc.perform(get("/groups/search")
                        .param("keyword", "bmw")
                        .with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groups[0].name").value("Favorites"));
    }

    @Test
    void getGroupById_returnsGroup() throws Exception {
        GroupDto group = new GroupDto(2L, "Wishlist", null);
        when(groupService.getGroupById(5L, 2L)).thenReturn(group);

        mockMvc.perform(get("/groups/2").with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Wishlist"));
    }

    @Test
    void updateGroup_returnsUpdated() throws Exception {
        GroupDto updated = new GroupDto(2L, "Renamed", "img.png");
        when(groupService.updateGroup(5L, 2L, "Renamed", "img.png")).thenReturn(updated);
        GroupBody body = new GroupBody("Renamed", "img.png");

        mockMvc.perform(put("/groups/2")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed"));
    }

    @Test
    void deleteGroupById_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/groups/2").with(authenticatedUser("5")))
                .andExpect(status().isNoContent());

        verify(groupService).deleteGroupById(5L, 2L);
    }

    @Test
    void getUserObjects_returnsPagedObjects() throws Exception {
        UserObjectDto object = new UserObjectDto(9L, 5L, 2L, 3L, "My Model", null, null, null, null);
        when(groupService.getUserObjectsPage(5L, 2L, 0, 48))
                .thenReturn(PageResponse.of(List.of(object), 0, 48, 1, true));

        mockMvc.perform(get("/groups/2/objects").with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("My Model"));
    }

    @Test
    void createUserObject_returnsCreated() throws Exception {
        UserObjectBody body = new UserObjectBody(3L, "My Model", null, null, null, null);
        UserObjectDto created = new UserObjectDto(9L, 5L, 2L, 3L, "My Model", null, null, null, null);
        when(groupService.createUserObject(5L, 2L, 3L, "My Model", null, null, null, null))
                .thenReturn(created);

        mockMvc.perform(post("/groups/2/objects")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("My Model"));
    }

    @Test
    void updateUserObject_returnsUpdated() throws Exception {
        UserObjectBody body = new UserObjectBody(4L, "Renamed", "new.png", null, null, null);
        UserObjectDto updated = new UserObjectDto(9L, 5L, 2L, 4L, "Renamed", "new.png", null, null, null);
        when(groupService.updateUserObject(5L, 9L, 4L, "Renamed", "new.png", null, null, null))
                .thenReturn(updated);

        mockMvc.perform(put("/groups/2/objects/9")
                        .with(authenticatedUser("5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed"));

        verify(groupService).updateUserObject(5L, 9L, 4L, "Renamed", "new.png", null, null, null);
    }

    @Test
    void deleteUserObject_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/groups/2/objects/9").with(authenticatedUser("5")))
                .andExpect(status().isNoContent());

        verify(groupService).deleteUserObjectById(5L, 9L);
    }

    @Test
    void searchUserObjects_returnsPagedResults() throws Exception {
        UserObjectDto object = new UserObjectDto(9L, 5L, 2L, 3L, "My Model", null, null, null, null);
        when(groupService.searchUserObjectsByGroupIdPage(eq(5L), eq(2L), eq("bmw"), eq(0), eq(48)))
                .thenReturn(PageResponse.of(List.of(object), 0, 48, 1, true));

        mockMvc.perform(get("/groups/2/objects/search")
                        .param("keyword", "bmw")
                        .with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("My Model"));
    }

    @Test
    void getUserObjectById_returnsObject() throws Exception {
        UserObjectDto object = new UserObjectDto(9L, 5L, 2L, 3L, "My Model", "img.png", null, null, null);
        when(groupService.getUserObjectById(5L, 2L, 9L)).thenReturn(object);

        mockMvc.perform(get("/groups/2/objects/9").with(authenticatedUser("5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("My Model"))
                .andExpect(jsonPath("$.imageUrl").value("img.png"));
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
