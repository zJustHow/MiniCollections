package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.exception.GroupNotFoundException;
import com.zjusthow.minicollections.exception.LimitExceededException;
import com.zjusthow.minicollections.exception.NoPermissionException;
import com.zjusthow.minicollections.model.GroupCombinedSearchDto;
import com.zjusthow.minicollections.model.UserObjectSearchDto;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.UserObjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock GroupRepository groupRepository;
    @Mock UserObjectRepository userObjectRepository;
    @Mock JdbcClient jdbcClient;
    @Mock ImageStorageService imageStorageService;

    @InjectMocks GroupService groupService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(groupService, "maxGroupsPerUser", 2);
        ReflectionTestUtils.setField(groupService, "maxObjectsPerGroup", 3);
    }

    @Test
    void createGroup_enforcesUserLimit() {
        when(groupRepository.countByUserId(1L)).thenReturn(2L);

        assertThrows(LimitExceededException.class,
                () -> groupService.createGroup(1L, "New Group", null));
        verify(groupRepository, never()).save(any());
    }

    @Test
    void getGroupById_rejectsOtherUsersGroup() {
        when(groupRepository.findById(10L)).thenReturn(Optional.of(
                new GroupEntity(10L, 99L, "Private", null)));

        assertThrows(NoPermissionException.class, () -> groupService.getGroupById(1L, 10L));
    }

    @Test
    void crossSearchPage_blankKeywordReturnsEmpty() {
        GroupCombinedSearchDto result = groupService.crossSearchPage(1L, "  ", 0, 24);

        assertTrue(result.groups().isEmpty());
        assertTrue(result.objects().isEmpty());
        assertEquals(0L, result.totalElements());
        verify(groupRepository, never()).countSearchByKeyword(any(), any());
    }

    @Test
    void createUserObject_enforcesGroupObjectLimit() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        when(userObjectRepository.countByGroupId(5L)).thenReturn(3L);

        assertThrows(LimitExceededException.class, () -> groupService.createUserObject(
                1L, 5L, 100L, "Item", null, null, null, null));
    }

    @Test
    void createGroup_persistsWhenUnderLimit() {
        when(groupRepository.countByUserId(1L)).thenReturn(1L);
        when(groupRepository.save(any(GroupEntity.class))).thenAnswer(invocation -> {
            GroupEntity entity = invocation.getArgument(0);
            return new GroupEntity(8L, entity.userId(), entity.name(), entity.imageUrl());
        });

        GroupDto created = groupService.createGroup(1L, "Wishlist", null);

        assertEquals(8L, created.id());
        assertEquals("Wishlist", created.name());
        ArgumentCaptor<GroupEntity> captor = ArgumentCaptor.forClass(GroupEntity.class);
        verify(groupRepository).save(captor.capture());
        assertEquals(1L, captor.getValue().userId());
    }

    @Test
    void updateGroup_rejectsOtherUsersGroup() {
        when(groupRepository.findById(10L)).thenReturn(Optional.of(
                new GroupEntity(10L, 99L, "Private", null)));

        assertThrows(NoPermissionException.class,
                () -> groupService.updateGroup(1L, 10L, "Renamed", null));
    }

    @Test
    void deleteGroupById_removesOwnedGroup() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        when(userObjectRepository.findByGroupId(5L)).thenReturn(Optional.of(Collections.emptyList()));

        groupService.deleteGroupById(1L, 5L);

        verify(groupRepository).deleteById(5L);
    }

    @Test
    void deleteGroupById_throwsWhenMissing() {
        when(groupRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(GroupNotFoundException.class, () -> groupService.deleteGroupById(1L, 99L));
    }

    @Test
    void crossSearchPage_returnsMatchingGroups() {
        stubJdbcSearch(0L, List.of());
        when(groupRepository.countSearchByKeyword(1L, "bmw")).thenReturn(1L);
        when(groupRepository.searchPageByKeyword(1L, "bmw", 1, 0))
                .thenReturn(List.of(new GroupEntity(2L, 1L, "BMW Group", null)));

        GroupCombinedSearchDto result = groupService.crossSearchPage(1L, "bmw", 0, 48);

        assertEquals(1, result.groups().size());
        assertEquals("BMW Group", result.groups().get(0).name());
        assertEquals(1L, result.totalGroups());
        assertTrue(result.objects().isEmpty());
    }

    @Test
    void crossSearchPage_returnsMatchingUserObjects() {
        UserObjectSearchDto object = new UserObjectSearchDto(
                100L, 1L, 5L, "Garage", 10L, "Custom", null, null, null, null,
                "M3", null, "BMW", null);
        stubJdbcSearch(1L, List.of(object));
        when(groupRepository.countSearchByKeyword(1L, "m3")).thenReturn(0L);

        GroupCombinedSearchDto result = groupService.crossSearchPage(1L, "m3", 0, 24);

        assertTrue(result.groups().isEmpty());
        assertEquals(1, result.objects().size());
        assertEquals("M3", result.objects().get(0).brandObjectNameEn());
        assertEquals(1L, result.totalObjects());
    }

    @Test
    void crossSearchPage_secondPageReturnsUserObjects() {
        UserObjectSearchDto first = new UserObjectSearchDto(
                100L, 1L, 5L, "Garage", 10L, "Custom1", null, null, null, null,
                "M3", null, "BMW", null);
        UserObjectSearchDto second = new UserObjectSearchDto(
                101L, 1L, 5L, "Garage", 11L, "Custom2", null, null, null, null,
                "M4", null, "BMW", null);
        stubJdbcSearch(3L, List.of(first, second));
        when(groupRepository.countSearchByKeyword(1L, "bmw")).thenReturn(2L);

        GroupCombinedSearchDto result = groupService.crossSearchPage(1L, "bmw", 1, 2);

        assertTrue(result.groups().isEmpty());
        assertEquals(2, result.objects().size());
        assertEquals("M3", result.objects().get(0).brandObjectNameEn());
        assertEquals(1, result.page());
        assertEquals(5L, result.totalElements());
    }

    @Test
    void crossSearchPage_firstPagePrefersGroups() {
        stubJdbcObjectCount(3L);
        when(groupRepository.countSearchByKeyword(1L, "bmw")).thenReturn(2L);
        when(groupRepository.searchPageByKeyword(1L, "bmw", 2, 0))
                .thenReturn(List.of(
                        new GroupEntity(2L, 1L, "G1", null),
                        new GroupEntity(3L, 1L, "G2", null)));

        GroupCombinedSearchDto result = groupService.crossSearchPage(1L, "bmw", 0, 2);

        assertEquals(2, result.groups().size());
        assertEquals("G1", result.groups().get(0).name());
        assertTrue(result.objects().isEmpty());
        assertEquals(2L, result.totalGroups());
        assertEquals(3L, result.totalObjects());
    }

    @SuppressWarnings("unchecked")
    private void stubJdbcObjectCount(long objectCount) {
        JdbcClient.StatementSpec spec = mock(JdbcClient.StatementSpec.class);
        JdbcClient.MappedQuerySpec<Long> countQuery = mock(JdbcClient.MappedQuerySpec.class);

        when(jdbcClient.sql(anyString())).thenReturn(spec);
        when(spec.param(anyString(), any())).thenReturn(spec);
        when(spec.query(Long.class)).thenReturn(countQuery);
        when(countQuery.single()).thenReturn(objectCount);
    }

    @SuppressWarnings("unchecked")
    private void stubJdbcSearch(long objectCount, List<?> objectRows) {
        JdbcClient.StatementSpec spec = mock(JdbcClient.StatementSpec.class);
        JdbcClient.MappedQuerySpec<Long> countQuery = mock(JdbcClient.MappedQuerySpec.class);
        JdbcClient.MappedQuerySpec<?> listQuery = mock(JdbcClient.MappedQuerySpec.class);

        when(jdbcClient.sql(anyString())).thenReturn(spec);
        when(spec.param(anyString(), any())).thenReturn(spec);
        when(spec.query(Long.class)).thenReturn(countQuery);
        when(spec.query(any(RowMapper.class))).thenReturn(listQuery);
        when(countQuery.single()).thenReturn(objectCount);
        when(listQuery.list()).thenReturn((List) objectRows);
    }
}
