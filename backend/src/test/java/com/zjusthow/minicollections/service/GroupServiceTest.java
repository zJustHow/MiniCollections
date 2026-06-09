package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.exception.GroupNotFoundException;
import com.zjusthow.minicollections.exception.LimitExceededException;
import com.zjusthow.minicollections.exception.NoPermissionException;
import com.zjusthow.minicollections.exception.UserObjectNotFoundException;
import com.zjusthow.minicollections.model.GroupCombinedSearchDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.UserObjectSearchDto;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.entity.UserObjectEntity;
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
    void getUserObjectsPage_rejectsOtherUsersGroup() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 99L, "Private", null)));

        assertThrows(NoPermissionException.class,
                () -> groupService.getUserObjectsPage(1L, 5L, 0, 24));
    }

    @Test
    void getGroupsPage_clampsOversizedPageSize() {
        when(groupRepository.countByUserId(1L)).thenReturn(0L);
        when(groupRepository.findPageByUserId(1L, 100, 0)).thenReturn(List.of());

        groupService.getGroupsPage(1L, 0, 500);

        verify(groupRepository).findPageByUserId(1L, 100, 0);
    }

    @Test
    void getGroupsPage_returnsPagedGroups() {
        when(groupRepository.countByUserId(1L)).thenReturn(2L);
        when(groupRepository.findPageByUserId(1L, 24, 0)).thenReturn(List.of(
                new GroupEntity(1L, 1L, "Garage", null),
                new GroupEntity(2L, 1L, "Wishlist", null)));

        PageResponse<GroupDto> result = groupService.getGroupsPage(1L, 0, 24);

        assertEquals(2, result.content().size());
        assertEquals("Garage", result.content().get(0).name());
        assertEquals(2L, result.totalElements());
    }

    @Test
    void getGroupById_returnsOwnedGroup() {
        when(groupRepository.findById(10L)).thenReturn(Optional.of(
                new GroupEntity(10L, 1L, "Garage", "img.png")));

        GroupDto group = groupService.getGroupById(1L, 10L);

        assertEquals(10L, group.id());
        assertEquals("Garage", group.name());
    }

    @Test
    void getGroupById_throwsWhenNotFound() {
        when(groupRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(GroupNotFoundException.class, () -> groupService.getGroupById(1L, 99L));
    }

    @Test
    void getUserObjectsPage_returnsGroupObjects() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        when(userObjectRepository.countByGroupId(5L)).thenReturn(1L);
        when(userObjectRepository.findPageByGroupId(5L, 24, 0)).thenReturn(List.of(
                new UserObjectEntity(10L, 1L, 5L, 100L, "M3", null, null, null, null)));

        PageResponse<UserObjectDto> result = groupService.getUserObjectsPage(1L, 5L, 0, 24);

        assertEquals(1, result.content().size());
        assertEquals("M3", result.content().get(0).name());
        assertEquals(1L, result.totalElements());
    }

    @Test
    void getUserObjectById_returnsOwnedObject() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        when(userObjectRepository.findById(10L)).thenReturn(Optional.of(
                new UserObjectEntity(10L, 1L, 5L, 100L, "M3", "img.png", null, null, null)));

        UserObjectDto object = groupService.getUserObjectById(1L, 5L, 10L);

        assertEquals(10L, object.id());
        assertEquals("M3", object.name());
    }

    @Test
    void getUserObjectById_rejectsObjectFromDifferentGroup() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        when(userObjectRepository.findById(10L)).thenReturn(Optional.of(
                new UserObjectEntity(10L, 1L, 99L, 100L, "M3", null, null, null, null)));

        assertThrows(NoPermissionException.class,
                () -> groupService.getUserObjectById(1L, 5L, 10L));
    }

    @Test
    void searchUserObjectsByGroupIdPage_blankKeywordReturnsEmpty() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));

        PageResponse<UserObjectDto> result =
                groupService.searchUserObjectsByGroupIdPage(1L, 5L, "  ", 0, 24);

        assertTrue(result.content().isEmpty());
        assertEquals(0L, result.totalElements());
        verify(jdbcClient, never()).sql(anyString());
    }

    @Test
    void updateGroup_throwsWhenNotFound() {
        when(groupRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(GroupNotFoundException.class,
                () -> groupService.updateGroup(1L, 99L, "Renamed", null));
    }

    @Test
    void deleteGroupById_rejectsOtherUsersGroup() {
        when(groupRepository.findById(10L)).thenReturn(Optional.of(
                new GroupEntity(10L, 99L, "Private", null)));

        assertThrows(NoPermissionException.class, () -> groupService.deleteGroupById(1L, 10L));
        verify(groupRepository, never()).deleteById(10L);
    }

    @Test
    void searchUserObjectsByGroupIdPage_returnsMatchingObjects() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        UserObjectDto object = new UserObjectDto(10L, 1L, 5L, 100L, "M3", null, null, null, null);
        stubJdbcSearch(1L, List.of(object));

        PageResponse<UserObjectDto> result =
                groupService.searchUserObjectsByGroupIdPage(1L, 5L, "m3", 0, 24);

        assertEquals(1, result.content().size());
        assertEquals("M3", result.content().get(0).name());
        assertEquals(1L, result.totalElements());
    }

    @Test
    void getUserObjectById_throwsWhenNotFound() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        when(userObjectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserObjectNotFoundException.class,
                () -> groupService.getUserObjectById(1L, 5L, 99L));
    }

    @Test
    void deleteGroupById_deletesGroupAndObjectImages() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", "group.png")));
        when(userObjectRepository.findByGroupId(5L)).thenReturn(Optional.of(List.of(
                new UserObjectEntity(10L, 1L, 5L, 100L, "M3", "obj.png", null, null, null))));

        groupService.deleteGroupById(1L, 5L);

        verify(imageStorageService).deleteUserImageIfOwned(1L, "group.png");
        verify(imageStorageService).deleteUserImageIfOwned(1L, "obj.png");
        verify(groupRepository).deleteById(5L);
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
    void createUserObject_rejectsOtherUsersGroup() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 99L, "Private", null)));

        assertThrows(NoPermissionException.class, () -> groupService.createUserObject(
                1L, 5L, 100L, "Item", null, null, null, null));
        verify(userObjectRepository, never()).save(any());
    }

    @Test
    void createUserObject_persistsForGroupOwner() {
        when(groupRepository.findById(5L)).thenReturn(Optional.of(
                new GroupEntity(5L, 1L, "Mine", null)));
        when(userObjectRepository.countByGroupId(5L)).thenReturn(0L);
        when(userObjectRepository.save(any())).thenAnswer(invocation -> {
            UserObjectEntity entity = invocation.getArgument(0);
            return new UserObjectEntity(
                    99L,
                    entity.userId(),
                    entity.groupId(),
                    entity.brandObjectId(),
                    entity.name(),
                    entity.imageUrl(),
                    entity.purchaseDate(),
                    entity.purchasePrice(),
                    entity.otherNotes());
        });

        UserObjectDto created = groupService.createUserObject(
                1L, 5L, 100L, "My M3", "img.png", null, null, "notes");

        assertEquals(99L, created.id());
        assertEquals("My M3", created.name());
    }

    @Test
    void updateUserObject_persistsChangesForOwner() {
        UserObjectEntity existing = new UserObjectEntity(
                20L, 1L, 5L, 100L, "Old", "old.png", null, null, null);
        when(userObjectRepository.findById(20L)).thenReturn(Optional.of(existing));
        when(userObjectRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        UserObjectDto updated = groupService.updateUserObject(
                1L, 20L, 101L, "New Name", "new.png", null, null, "notes");

        assertEquals("New Name", updated.name());
        assertEquals(101L, updated.brandObjectId());
        verify(imageStorageService).deleteReplacedUserImage(1L, "old.png", "new.png");
    }

    @Test
    void updateUserObject_rejectsOtherUsersObject() {
        when(userObjectRepository.findById(20L)).thenReturn(Optional.of(
                new UserObjectEntity(20L, 99L, 5L, 100L, "Theirs", "img.png", null, null, null)));

        assertThrows(NoPermissionException.class,
                () -> groupService.updateUserObject(
                        1L, 20L, 100L, "Hack", null, null, null, null));
        verify(userObjectRepository, never()).save(any());
    }

    @Test
    void updateUserObject_throwsWhenNotFound() {
        when(userObjectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserObjectNotFoundException.class,
                () -> groupService.updateUserObject(
                        1L, 99L, 100L, "Missing", null, null, null, null));
    }

    @Test
    void deleteUserObjectById_removesOwnedObject() {
        when(userObjectRepository.findById(20L)).thenReturn(Optional.of(
                new UserObjectEntity(20L, 1L, 5L, 100L, "Mine", "img.png", null, null, null)));

        groupService.deleteUserObjectById(1L, 20L);

        verify(imageStorageService).deleteUserImageIfOwned(1L, "img.png");
        verify(userObjectRepository).deleteById(20L);
    }

    @Test
    void deleteUserObjectById_rejectsOtherUsersObject() {
        when(userObjectRepository.findById(20L)).thenReturn(Optional.of(
                new UserObjectEntity(20L, 99L, 5L, 100L, "Theirs", "img.png", null, null, null)));

        assertThrows(NoPermissionException.class,
                () -> groupService.deleteUserObjectById(1L, 20L));
        verify(userObjectRepository, never()).deleteById(20L);
    }

    @Test
    void deleteUserObjectById_throwsWhenNotFound() {
        when(userObjectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserObjectNotFoundException.class,
                () -> groupService.deleteUserObjectById(1L, 99L));
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
    void updateGroup_persistsChangesForOwner() {
        GroupEntity existing = new GroupEntity(10L, 1L, "Garage", "old.png");
        when(groupRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(groupRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        GroupDto updated = groupService.updateGroup(1L, 10L, "Workshop", "new.png");

        assertEquals("Workshop", updated.name());
        verify(imageStorageService).deleteReplacedUserImage(1L, "old.png", "new.png");
        verify(groupRepository).save(new GroupEntity(10L, 1L, "Workshop", "new.png"));
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
