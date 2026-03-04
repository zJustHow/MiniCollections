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
import java.util.Map;
import java.util.stream.Collectors;

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
        List<GroupEntity> groupEntities = groupRepository.findByUserId(userId)
                .orElseThrow(() -> new GroupNotFoundException());
        List<UserObjectEntity> userObjectEntities = userObjectRepository.findByUserId(userId)
                .orElseThrow(() -> new UserObjectNotFoundException());
        Map<Long, List<UserObjectEntity>> userObjectEntitiesMap = userObjectEntities.stream()
                .collect(Collectors.groupingBy(UserObjectEntity::groupId));

        return groupEntities.stream()
                .map(groupEntity -> {
                    List<UserObjectEntity> userObjectEntitiesList = userObjectEntitiesMap.getOrDefault(groupEntity.id(), Collections.emptyList());
                    List<UserObjectDto> UserObjectDtos = userObjectEntitiesList.stream()
                            .map(UserObjectDto::new)
                            .toList();
                    return new GroupDto(groupEntity, UserObjectDtos);
                })
                .toList();
    }

    @Cacheable(
            value = "groups",
            key = "'groups_' + #userId + '_' + #id"
    )
    public GroupDto getGroupById(Long userId, Long id) {
        List<GroupDto> GroupDtos = getGroups(userId);
        return GroupDtos.stream()
                .filter(groupDto -> groupDto.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new GroupNotFoundException());
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
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }

        GroupEntity groupEntity = new GroupEntity(null, userId, name, imageUrl);
        GroupEntity savedGroupEntity = groupRepository.save(groupEntity);
        return new GroupDto(savedGroupEntity, Collections.emptyList());
    }

    @CacheEvict(
            value = "groups",
            allEntries = true
    )
    @Transactional
    public GroupDto updateGroup(Long userId, Long groupId, String name, String imageUrl) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }

        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException());

        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to update this group");
        }

        GroupEntity updatedGroupEntity = new GroupEntity(groupId, userId, groupEntity.name(), imageUrl);

        GroupEntity savedGroupEntity = groupRepository.save(updatedGroupEntity);

        List<UserObjectDto> userObjectDtos = userObjectRepository.findByGroupId(groupId)
                .orElse(Collections.emptyList())
                .stream()
                .map(UserObjectDto::new)
                .collect(Collectors.toList());

        return new GroupDto(groupId, savedGroupEntity.name(), savedGroupEntity.imageUrl(), userObjectDtos);
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
            key = "'search' + #userId + '_' + #groupId + '_' + #keyword"
    )
    public List<UserObjectDto> searchUserObjects(Long userId, Long groupId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException());

        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to delete this group");
        }

        List<UserObjectEntity> userObjectEntities = userObjectRepository.findByGroupId(groupId)
                .orElse(Collections.emptyList());

        String lowerCaseKeyword = keyword.toLowerCase();

        return userObjectEntities.stream()
                .filter(userObjectEntity -> userObjectEntity.name().toLowerCase().contains(lowerCaseKeyword))
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
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }

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
    public void deleteUserObjectById(Long userId, Long userObjectId) {
        UserObjectEntity userObjectEntity = userObjectRepository.findById(userObjectId)
                .orElseThrow(() -> new UserObjectNotFoundException());

        if (!userObjectEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to delete this user object");
        }

        userObjectRepository.deleteById(userObjectId);
    }

}
