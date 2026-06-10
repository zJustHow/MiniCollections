package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.model.GroupBody;
import com.zjusthow.minicollections.model.GroupCombinedSearchDto;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.OrderIdsDto;
import com.zjusthow.minicollections.model.PageResponse;
import com.zjusthow.minicollections.model.ReorderBody;
import com.zjusthow.minicollections.model.UserObjectBody;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/groups")
public class GroupController {
    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    private Long userId(User user) {
        return Long.parseLong(user.getUsername());
    }

    @GetMapping
    public ResponseEntity<PageResponse<GroupDto>> getGroups(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "48") int size) {
        return ResponseEntity.ok(groupService.getGroupsPage(userId(user), page, size));
    }

    @GetMapping("/order")
    public ResponseEntity<OrderIdsDto> getGroupOrder(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupService.getGroupOrder(userId(user)));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderGroups(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid ReorderBody body) {
        groupService.reorderGroups(userId(user), body.orderedIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<GroupCombinedSearchDto> searchGroups(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "48") int size) {
        return ResponseEntity.ok(groupService.crossSearchPage(userId(user), keyword, page, size));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDto> getGroupById(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupById(userId(user), groupId));
    }

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid GroupBody groupBody) {
        GroupDto groupDto = groupService.createGroup(userId(user), groupBody.name(), groupBody.imageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(groupDto);
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<GroupDto> updateGroup(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestBody @Valid GroupBody groupBody) {
        GroupDto groupDto = groupService.updateGroup(userId(user), groupId, groupBody.name(), groupBody.imageUrl());
        return ResponseEntity.ok(groupDto);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroupById(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId) {
        groupService.deleteGroupById(userId(user), groupId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}/objects")
    public ResponseEntity<PageResponse<UserObjectDto>> getUserObjects(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "48") int size) {
        return ResponseEntity.ok(groupService.getUserObjectsPage(userId(user), groupId, page, size));
    }

    @GetMapping("/{groupId}/objects/order")
    public ResponseEntity<OrderIdsDto> getUserObjectOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getUserObjectOrder(userId(user), groupId));
    }

    @PutMapping("/{groupId}/objects/reorder")
    public ResponseEntity<Void> reorderUserObjects(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestBody @Valid ReorderBody body) {
        groupService.reorderUserObjects(userId(user), groupId, body.orderedIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}/objects/search")
    public ResponseEntity<PageResponse<UserObjectDto>> searchUserObjects(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "48") int size) {
        return ResponseEntity.ok(
                groupService.searchUserObjectsByGroupIdPage(userId(user), groupId, keyword, page, size));
    }

    @GetMapping("/{groupId}/objects/{userObjectId}")
    public ResponseEntity<UserObjectDto> getUserObjectById(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @PathVariable Long userObjectId) {
        return ResponseEntity.ok(groupService.getUserObjectById(userId(user), groupId, userObjectId));
    }

    @PostMapping("/{groupId}/objects")
    public ResponseEntity<UserObjectDto> createUserObject(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestBody @Valid UserObjectBody userObjectBody) {
        UserObjectDto userObjectDto = groupService.createUserObject(
                userId(user),
                groupId,
                userObjectBody.brandObjectId(),
                userObjectBody.name(),
                userObjectBody.imageUrl(),
                userObjectBody.purchaseDate(),
                userObjectBody.purchasePrice(),
                userObjectBody.otherNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(userObjectDto);
    }

    @PutMapping("/{groupId}/objects/{userObjectId}")
    public ResponseEntity<UserObjectDto> updateUserObject(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @PathVariable Long userObjectId,
            @RequestBody @Valid UserObjectBody userObjectBody) {
        UserObjectDto dto = groupService.updateUserObject(
                userId(user),
                userObjectId,
                userObjectBody.brandObjectId(),
                userObjectBody.name(),
                userObjectBody.imageUrl(),
                userObjectBody.purchaseDate(),
                userObjectBody.purchasePrice(),
                userObjectBody.otherNotes());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{groupId}/objects/{userObjectId}")
    public ResponseEntity<Void> deleteUserObjectById(
            @AuthenticationPrincipal User user,
            @PathVariable Long userObjectId) {
        groupService.deleteUserObjectById(userId(user), userObjectId);
        return ResponseEntity.noContent().build();
    }
}
