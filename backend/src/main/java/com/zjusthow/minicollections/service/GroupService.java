package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.UserObjectEntity;
import com.zjusthow.minicollections.exception.GroupNotFoundException;
import com.zjusthow.minicollections.exception.NoPermissionException;
import com.zjusthow.minicollections.exception.UserObjectNotFoundException;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.UserObjectRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserObjectRepository userObjectRepository;

    public GroupService(
            GroupRepository groupRepository,
            UserObjectRepository userObjectRepository) {
        this.groupRepository = groupRepository;
        this.userObjectRepository = userObjectRepository;
    }

    @Cacheable(
            value = "groups",
            key = "'groups_' + #userId"
    )
    public List<GroupDto> getGroups(Long userId) {
        return groupRepository.findByUserId(userId)
                .orElseThrow(() -> new GroupNotFoundException())
                .stream()
                .map(GroupDto::new)
                .toList();
    }

    @Cacheable(
            value = "groups",
            key = "'groups_' + #userId + '_' + #id"
    )
    public GroupDto getGroupById(Long userId, Long id) {
        GroupEntity group = groupRepository.findById(id)
                .orElseThrow(GroupNotFoundException::new);
        if (!group.userId().equals(userId)) {
            throw new NoPermissionException("No permission to view this group");
        }
        return new GroupDto(group);
    }

    @Cacheable(
            value = "groups",
            key = "'search_' + #userId + '_' + #keyword"
    )
    public List<GroupDto> searchGroups(Long userId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<GroupDto> GroupDtos = getGroups(userId);

        String lowerCaseKeyword = keyword.toLowerCase();

        return GroupDtos.stream()
                .filter(groupDto -> groupDto.name().toLowerCase().contains(lowerCaseKeyword))
                .toList();
    }

    @CacheEvict(
            value = "groups",
            allEntries = true
    )
    @Transactional
    public GroupDto createGroup(Long userId, String name, String imageUrl) {
        GroupEntity groupEntity = new GroupEntity(null, userId, name, imageUrl);
        GroupEntity savedGroupEntity = groupRepository.save(groupEntity);
        return new GroupDto(savedGroupEntity);
    }

    @CacheEvict(
            value = "groups",
            allEntries = true
    )
    @Transactional
    public GroupDto updateGroup(Long userId, Long groupId, String name, String imageUrl) {
        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException());

        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to update this group");
        }

        GroupEntity updatedGroupEntity = new GroupEntity(groupId, userId, name, imageUrl);
        GroupEntity savedGroupEntity = groupRepository.save(updatedGroupEntity);
        return new GroupDto(savedGroupEntity);
    }

    @CacheEvict(
            value = {"groups", "user_objects"},
            allEntries = true
    )
    @Transactional
    public void deleteGroupById(Long userId, Long groupId) {
        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException());

        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to delete this group");
        }

        groupRepository.deleteById(groupId);
    }

    @Cacheable(
            value = "user_objects",
            key = "'group_' + #userId + '_' + #groupId"
    )
    public List<UserObjectDto> getUserObjects(Long userId, Long groupId) {
        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException());
        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to view this group");
        }
        return userObjectRepository.findByGroupId(groupId)
                .orElse(Collections.emptyList())
                .stream()
                .map(UserObjectDto::new)
                .toList();
    }

    @CacheEvict(
            value = {"groups", "user_objects"},
            allEntries = true
    )
    @Transactional
    public UserObjectDto createUserObject(
            Long userId,
            Long groupId,
            Long brandObjectId,
            String name,
            String imageUrl,
            java.time.LocalDate purchaseDate,
            java.math.BigDecimal purchasePrice,
            String otherNotes
    ) {
        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException());

        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to add user object to this group");
        }

        UserObjectEntity userObjectEntity = new UserObjectEntity(
                null,
                userId,
                groupId,
                brandObjectId,
                name,
                imageUrl,
                purchaseDate,
                purchasePrice,
                otherNotes
        );
        UserObjectEntity savedUserObjectEntity = userObjectRepository.save(userObjectEntity);
        return new UserObjectDto(savedUserObjectEntity);
    }

    @CacheEvict(
            value = {"groups", "user_objects"},
            allEntries = true
    )
    @Transactional
    public UserObjectDto updateUserObject(
            Long userId,
            Long userObjectId,
            Long brandObjectId,
            String name,
            String imageUrl,
            java.time.LocalDate purchaseDate,
            java.math.BigDecimal purchasePrice,
            String otherNotes
    ) {
        UserObjectEntity existing = userObjectRepository.findById(userObjectId)
                .orElseThrow(() -> new UserObjectNotFoundException());
        if (!existing.userId().equals(userId)) {
            throw new NoPermissionException("No permission to update this user object");
        }
        // Preserve existing image when only changing brand association (do not overwrite with new brand's image)
        String resolvedImageUrl = imageUrl != null ? imageUrl : existing.imageUrl();
        UserObjectEntity updated = new UserObjectEntity(
                userObjectId,
                existing.userId(),
                existing.groupId(),
                brandObjectId != null ? brandObjectId : existing.brandObjectId(),
                name,
                resolvedImageUrl,
                purchaseDate,
                purchasePrice,
                otherNotes
        );
        UserObjectEntity saved = userObjectRepository.save(updated);
        return new UserObjectDto(saved);
    }

    @CacheEvict(
            value = {"groups", "user_objects"},
            allEntries = true
    )
    @Transactional
    public void deleteUserObjectById(Long userId, Long userObjectId) {
        UserObjectEntity userObjectEntity = userObjectRepository.findById(userObjectId)
                .orElseThrow(() -> new UserObjectNotFoundException());

        if (!userObjectEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to delete this user object");
        }

        userObjectRepository.deleteById(userObjectId);
    }

}
