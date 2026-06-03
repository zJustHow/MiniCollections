package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandObjectSearchFacetsDto;
import com.zjusthow.minicollections.model.GroupBody;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.GroupSearchResult;
import com.zjusthow.minicollections.model.UserObjectBody;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
public class GroupController {
    private final GroupService groupService;
    private final DisplayLocaleResolver displayLocaleResolver;

    public GroupController(GroupService groupService, DisplayLocaleResolver displayLocaleResolver) {
        this.groupService = groupService;
        this.displayLocaleResolver = displayLocaleResolver;
    }

    private Long userId(User user) {
        return Long.parseLong(user.getUsername());
    }

    private String effectiveLocale(String acceptLanguage, User user) {
        return displayLocaleResolver.resolveEffectiveLocale(acceptLanguage, user);
    }

    @GetMapping
    public ResponseEntity<List<GroupDto>> getGroups(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupService.getGroups(userId(user)));
    }

    @GetMapping("/search/facets")
    public ResponseEntity<BrandObjectSearchFacetsDto> searchGroupsFacets(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword,
            @RequestHeader(value = HttpHeaders.ACCEPT_LANGUAGE, required = false) String acceptLanguage) {
        return ResponseEntity.ok(groupService.searchCollectionFacets(
                userId(user), keyword, effectiveLocale(acceptLanguage, user)));
    }

    @GetMapping("/search")
    public ResponseEntity<GroupSearchResult> searchGroups(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(required = false) List<Long> scaleIds) {
        return ResponseEntity.ok(groupService.crossSearch(
                userId(user), keyword, categoryIds, brandIds, scaleIds));
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
    public ResponseEntity<List<UserObjectDto>> getUserObjects(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getUserObjects(userId(user), groupId));
    }

    @GetMapping("/{groupId}/objects/search")
    public ResponseEntity<List<UserObjectDto>> searchUserObjects(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestParam String keyword) {
        return ResponseEntity.ok(groupService.searchUserObjectsByGroupId(userId(user), groupId, keyword));
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
