package com.zjusthow.minicollections.controller;

import com.zjusthow.minicollections.entity.UserEntity;
import com.zjusthow.minicollections.model.GroupBody;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.UserObjectBody;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.service.GroupService;
import com.zjusthow.minicollections.service.UserService;
import jakarta.validation.Valid;
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
    private final UserService userService;

    public GroupController(GroupService groupService, UserService userService) {
        this.groupService = groupService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<GroupDto>> getGroups(
            @AuthenticationPrincipal User user
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        return ResponseEntity.ok(groupService.getGroups(userEntity.id()));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDto> getGroupById(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        return ResponseEntity.ok(groupService.getGroupById(userEntity.id(), groupId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<GroupDto>> searchGroups(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        return ResponseEntity.ok(groupService.searchGroups(userEntity.id(), keyword));
    }

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid GroupBody groupBody
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        GroupDto groupDto = groupService.createGroup(userEntity.id(), groupBody.name(), groupBody.imageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(groupDto);
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<GroupDto> updateGroup(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestBody @Valid GroupBody groupBody
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        GroupDto groupDto = groupService.updateGroup(userEntity.id(), groupId, groupBody.name(), groupBody.imageUrl());
        return ResponseEntity.ok(groupDto);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroupById(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        groupService.deleteGroupById(userEntity.id(), groupId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}/objects")
    public ResponseEntity<List<UserObjectDto>> getUserObjects(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        return ResponseEntity.ok(groupService.getUserObjects(userEntity.id(), groupId));
    }

    @PostMapping("/{groupId}/objects")
    public ResponseEntity<UserObjectDto> createUserObject(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @RequestBody @Valid UserObjectBody userObjectBody
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        UserObjectDto userObjectDto = groupService.createUserObject(
                userEntity.id(),
                groupId,
                userObjectBody.brandObjectId(),
                userObjectBody.name(),
                userObjectBody.imageUrl(),
                userObjectBody.purchaseDate(),
                userObjectBody.purchasePrice(),
                userObjectBody.otherNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(userObjectDto);
    }

    @PutMapping("/{groupId}/objects/{userObjectId}")
    public ResponseEntity<UserObjectDto> updateUserObject(
            @AuthenticationPrincipal User user,
            @PathVariable Long groupId,
            @PathVariable Long userObjectId,
            @RequestBody @Valid UserObjectBody userObjectBody
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        UserObjectDto dto = groupService.updateUserObject(
                userEntity.id(),
                userObjectId,
                userObjectBody.brandObjectId(),
                userObjectBody.name(),
                userObjectBody.imageUrl(),
                userObjectBody.purchaseDate(),
                userObjectBody.purchasePrice(),
                userObjectBody.otherNotes()
        );
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{groupId}/objects/{userObjectId}")
    public ResponseEntity<Void> deleteUserObjectById(
            @AuthenticationPrincipal User user,
            @PathVariable Long userObjectId
    ) {
        UserEntity userEntity = userService.getUserByEmail(user.getUsername());
        groupService.deleteUserObjectById(userEntity.id(), userObjectId);
        return ResponseEntity.noContent().build();
    }

}
