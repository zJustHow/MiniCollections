package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.elasticsearch.BrandObjectElasticsearchQueryService;
import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.UserObjectEntity;
import com.zjusthow.minicollections.exception.GroupNotFoundException;
import com.zjusthow.minicollections.exception.NoPermissionException;
import com.zjusthow.minicollections.exception.LimitExceededException;
import com.zjusthow.minicollections.exception.UserObjectNotFoundException;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.GroupSearchResult;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.model.UserObjectSearchDto;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.UserObjectRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserObjectRepository userObjectRepository;
    private final BrandObjectElasticsearchQueryService esQueryService;
    private final JdbcClient jdbcClient;

    @Value("${app.limits.max-groups-per-user}")
    private int maxGroupsPerUser;

    @Value("${app.limits.max-objects-per-group}")
    private int maxObjectsPerGroup;

    public GroupService(
            GroupRepository groupRepository,
            UserObjectRepository userObjectRepository,
            BrandObjectElasticsearchQueryService esQueryService,
            JdbcClient jdbcClient) {
        this.groupRepository = groupRepository;
        this.userObjectRepository = userObjectRepository;
        this.esQueryService = esQueryService;
        this.jdbcClient = jdbcClient;
    }

    @Cacheable(
            value = "groups",
            key = "'groups_' + #userId"
    )
    public List<GroupDto> getGroups(Long userId) {
        return groupRepository.findByUserId(userId)
                .orElseThrow(GroupNotFoundException::new)
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

    public GroupSearchResult crossSearch(Long userId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new GroupSearchResult(Collections.emptyList(), Collections.emptyList());
        }

        List<GroupDto> groups = groupRepository.searchByKeyword(userId, keyword)
                .stream().map(GroupDto::new).toList();

        List<Long> brandObjectIds = esQueryService.searchIdsByKeyword(keyword);
        List<Long> safeIds = brandObjectIds.isEmpty() ? List.of(-1L) : brandObjectIds;

        List<UserObjectSearchDto> objects = jdbcClient.sql("""
                        SELECT DISTINCT uo.id, uo.user_id, uo.group_id, g.name AS group_name,
                               uo.brand_object_id, uo.name, uo.image_url, uo.purchase_date,
                               uo.purchase_price, uo.other_notes,
                               bo.name_en AS brand_object_name_en,
                               bo.name_zh AS brand_object_name_zh,
                               br.name_en AS brand_name_en,
                               br.name_zh AS brand_name_zh
                        FROM user_objects uo
                        JOIN groups g ON uo.group_id = g.id
                        LEFT JOIN brand_objects bo ON uo.brand_object_id = bo.id
                        LEFT JOIN brands br ON bo.brand_id = br.id
                        WHERE uo.user_id = :userId
                          AND (
                            uo.name ILIKE '%' || :keyword || '%'
                            OR uo.brand_object_id = ANY(:brandObjectIds)
                          )
                        """)
                .param("userId", userId)
                .param("keyword", keyword)
                .param("brandObjectIds", safeIds.toArray(Long[]::new))
                .query((rs, rowNum) -> new UserObjectSearchDto(
                        rs.getLong("id"),
                        rs.getLong("user_id"),
                        rs.getLong("group_id"),
                        rs.getString("group_name"),
                        rs.getObject("brand_object_id") != null ? rs.getLong("brand_object_id") : null,
                        rs.getString("name"),
                        rs.getString("image_url"),
                        rs.getObject("purchase_date") != null ? rs.getObject("purchase_date", Date.class).toLocalDate() : null,
                        rs.getObject("purchase_price") != null ? rs.getBigDecimal("purchase_price") : null,
                        rs.getString("other_notes"),
                        rs.getString("brand_object_name_en"),
                        rs.getString("brand_object_name_zh"),
                        rs.getString("brand_name_en"),
                        rs.getString("brand_name_zh")
                ))
                .list();

        return new GroupSearchResult(groups, objects);
    }

    @CacheEvict(
            value = "groups",
            allEntries = true
    )
    @Transactional
    public GroupDto createGroup(Long userId, String name, String imageUrl) {
        int current = groupRepository.findByUserId(userId)
                .map(List::size).orElse(0);
        if (current >= maxGroupsPerUser) {
            throw new LimitExceededException("error.group.limit", maxGroupsPerUser);
        }
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

        GroupEntity updatedGroupEntity = new GroupEntity(
                groupId,
                userId,
                name,
                imageUrl
        );
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

    public List<UserObjectDto> searchUserObjectsByGroupId(Long userId, Long groupId, String keyword) {
        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(GroupNotFoundException::new);
        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to view this group");
        }
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> brandObjectIds;
        try {
            brandObjectIds = esQueryService.searchIdsByKeyword(keyword.trim());
        } catch (Exception e) {
            brandObjectIds = List.of();
        }
        List<Long> safeIds = brandObjectIds.isEmpty() ? List.of(-1L) : brandObjectIds;

        return jdbcClient.sql("""
                        SELECT id, user_id, group_id, brand_object_id, name, image_url,
                               purchase_date, purchase_price, other_notes
                        FROM user_objects
                        WHERE group_id = :groupId
                          AND user_id = :userId
                          AND (
                            name ILIKE '%' || :keyword || '%'
                            OR brand_object_id = ANY(:brandObjectIds)
                          )
                        """)
                .param("groupId", groupId)
                .param("userId", userId)
                .param("keyword", keyword.trim())
                .param("brandObjectIds", safeIds.toArray(Long[]::new))
                .query((rs, rowNum) -> new UserObjectDto(
                        rs.getLong("id"),
                        rs.getLong("user_id"),
                        rs.getLong("group_id"),
                        rs.getObject("brand_object_id") != null ? rs.getLong("brand_object_id") : null,
                        rs.getString("name"),
                        rs.getString("image_url"),
                        rs.getObject("purchase_date") != null ? rs.getObject("purchase_date", Date.class).toLocalDate() : null,
                        rs.getObject("purchase_price") != null ? rs.getBigDecimal("purchase_price") : null,
                        rs.getString("other_notes")
                ))
                .list();
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
            LocalDate purchaseDate,
            BigDecimal purchasePrice,
            String otherNotes
    ) {
        GroupEntity groupEntity = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException());

        if (!groupEntity.userId().equals(userId)) {
            throw new NoPermissionException("No permission to add user object to this group");
        }

        int current = userObjectRepository.findByGroupId(groupId)
                .map(List::size).orElse(0);
        if (current >= maxObjectsPerGroup) {
            throw new LimitExceededException("error.object.limit", maxObjectsPerGroup);
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
            LocalDate purchaseDate,
            BigDecimal purchasePrice,
            String otherNotes
    ) {
        UserObjectEntity existing = userObjectRepository.findById(userObjectId)
                .orElseThrow(() -> new UserObjectNotFoundException());
        if (!existing.userId().equals(userId)) {
            throw new NoPermissionException("No permission to update this user object");
        }
        UserObjectEntity updated = new UserObjectEntity(
                userObjectId,
                existing.userId(),
                existing.groupId(),
                brandObjectId,
                name,
                imageUrl,
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
