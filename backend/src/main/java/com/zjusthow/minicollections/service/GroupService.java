package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.entity.GroupEntity;
import com.zjusthow.minicollections.entity.UserObjectEntity;
import com.zjusthow.minicollections.exception.GroupNotFoundException;
import com.zjusthow.minicollections.exception.NoPermissionException;
import com.zjusthow.minicollections.exception.LimitExceededException;
import com.zjusthow.minicollections.exception.UserObjectNotFoundException;
import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.CategoryEntity;
import com.zjusthow.minicollections.entity.ScaleEntity;
import com.zjusthow.minicollections.entity.SeriesEntity;
import com.zjusthow.minicollections.i18n.DisplayLocaleResolver;
import com.zjusthow.minicollections.model.BrandFacetDto;
import com.zjusthow.minicollections.model.BrandObjectSearchFacetsDto;
import com.zjusthow.minicollections.model.BrandObjectSearchFilter;
import com.zjusthow.minicollections.model.CategoryFacetDto;
import com.zjusthow.minicollections.model.GroupDto;
import com.zjusthow.minicollections.model.GroupSearchResult;
import com.zjusthow.minicollections.model.ScaleFacetDto;
import com.zjusthow.minicollections.model.SeriesFacetDto;
import com.zjusthow.minicollections.model.UserObjectDto;
import com.zjusthow.minicollections.model.UserObjectSearchDto;
import com.zjusthow.minicollections.repository.BrandRepository;
import com.zjusthow.minicollections.repository.CategoryRepository;
import com.zjusthow.minicollections.repository.CategoryFacetRow;
import com.zjusthow.minicollections.repository.FacetCountRow;
import com.zjusthow.minicollections.repository.GroupRepository;
import com.zjusthow.minicollections.repository.ScaleRepository;
import com.zjusthow.minicollections.repository.SeriesRepository;
import com.zjusthow.minicollections.repository.UserObjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class GroupService {

    private static final String USER_OBJECT_SEARCH_FROM = """
            FROM user_objects uo
            JOIN groups g ON uo.group_id = g.id
            LEFT JOIN brand_objects bo ON uo.brand_object_id = bo.id
            LEFT JOIN brands br ON bo.brand_id = br.id
            """;

    private static final String USER_OBJECT_KEYWORD_MATCH = """
            uo.user_id = :userId
              AND (
                uo.name       ILIKE '%' || :keyword || '%'
                OR bo.name_en ILIKE '%' || :keyword || '%'
                OR bo.name_zh ILIKE '%' || :keyword || '%'
                OR br.name_en ILIKE '%' || :keyword || '%'
                OR br.name_zh ILIKE '%' || :keyword || '%'
              )
            """;

    private final GroupRepository groupRepository;
    private final UserObjectRepository userObjectRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ScaleRepository scaleRepository;
    private final SeriesRepository seriesRepository;
    private final DisplayLocaleResolver displayLocaleResolver;
    private final JdbcClient jdbcClient;
    private final ImageStorageService imageStorageService;

    @Value("${app.limits.max-groups-per-user}")
    private int maxGroupsPerUser;

    @Value("${app.limits.max-objects-per-group}")
    private int maxObjectsPerGroup;

    public GroupService(
            GroupRepository groupRepository,
            UserObjectRepository userObjectRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ScaleRepository scaleRepository,
            SeriesRepository seriesRepository,
            DisplayLocaleResolver displayLocaleResolver,
            JdbcClient jdbcClient,
            @Autowired(required = false) ImageStorageService imageStorageService) {
        this.groupRepository = groupRepository;
        this.userObjectRepository = userObjectRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.scaleRepository = scaleRepository;
        this.seriesRepository = seriesRepository;
        this.displayLocaleResolver = displayLocaleResolver;
        this.jdbcClient = jdbcClient;
        this.imageStorageService = imageStorageService;
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

    public GroupSearchResult crossSearch(
            Long userId,
            String keyword,
            List<Long> categoryIds,
            List<Long> brandIds,
            List<Long> scaleIds,
            List<Long> seriesIds) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new GroupSearchResult(Collections.emptyList(), Collections.emptyList());
        }

        String trimmed = keyword.trim();
        BrandObjectSearchFilter filter =
                BrandObjectSearchFilter.global(categoryIds, brandIds, scaleIds, seriesIds);

        List<GroupDto> groups = groupRepository.searchByKeyword(userId, trimmed)
                .stream().map(GroupDto::new).toList();

        List<UserObjectSearchDto> objects = searchUserObjects(userId, trimmed, filter);
        return new GroupSearchResult(groups, objects);
    }

    public BrandObjectSearchFacetsDto searchCollectionFacets(
            Long userId,
            String keyword,
            String effectiveLocale) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new BrandObjectSearchFacetsDto(0L, List.of(), List.of(), List.of(), List.of());
        }
        String trimmed = keyword.trim();
        boolean preferZh = displayLocaleResolver.prefersZh(effectiveLocale);
        long total = countUserObjectSearch(userId, trimmed);
        List<CategoryFacetDto> categories = toCategoryFacetDtos(
                jdbcClient.sql("""
                                SELECT bo.category_id AS category_id, COUNT(DISTINCT uo.id) AS cnt
                                """ + USER_OBJECT_SEARCH_FROM + """
                                WHERE """ + USER_OBJECT_KEYWORD_MATCH + """
                                  AND bo.category_id IS NOT NULL
                                GROUP BY bo.category_id
                                ORDER BY cnt DESC, bo.category_id ASC
                                """)
                        .param("userId", userId)
                        .param("keyword", trimmed)
                        .query((rs, rowNum) -> new CategoryFacetRow(
                                rs.getLong("category_id"),
                                rs.getLong("cnt")))
                        .list(),
                preferZh);
        List<BrandFacetDto> brands = toBrandFacetDtos(
                jdbcClient.sql("""
                                SELECT bo.brand_id AS id, COUNT(DISTINCT uo.id) AS cnt
                                """ + USER_OBJECT_SEARCH_FROM + """
                                WHERE """ + USER_OBJECT_KEYWORD_MATCH + """
                                  AND bo.brand_id IS NOT NULL
                                GROUP BY bo.brand_id
                                ORDER BY cnt DESC, bo.brand_id ASC
                                """)
                        .param("userId", userId)
                        .param("keyword", trimmed)
                        .query(FacetCountRow.class)
                        .list(),
                preferZh);
        List<ScaleFacetDto> scales = toScaleFacetDtos(
                jdbcClient.sql("""
                                SELECT bo.scale_id AS id, COUNT(DISTINCT uo.id) AS cnt
                                """ + USER_OBJECT_SEARCH_FROM + """
                                WHERE """ + USER_OBJECT_KEYWORD_MATCH + """
                                  AND bo.scale_id IS NOT NULL
                                GROUP BY bo.scale_id
                                ORDER BY cnt DESC, bo.scale_id ASC
                                """)
                        .param("userId", userId)
                        .param("keyword", trimmed)
                        .query(FacetCountRow.class)
                        .list());
        List<SeriesFacetDto> series = toSeriesFacetDtos(
                jdbcClient.sql("""
                                SELECT bo.series_id AS id, COUNT(DISTINCT uo.id) AS cnt
                                """ + USER_OBJECT_SEARCH_FROM + """
                                WHERE """ + USER_OBJECT_KEYWORD_MATCH + """
                                  AND bo.series_id IS NOT NULL
                                GROUP BY bo.series_id
                                ORDER BY cnt DESC, bo.series_id ASC
                                """)
                        .param("userId", userId)
                        .param("keyword", trimmed)
                        .query(FacetCountRow.class)
                        .list(),
                preferZh);
        return new BrandObjectSearchFacetsDto(total, categories, brands, scales, series);
    }

    private long countUserObjectSearch(Long userId, String keyword) {
        Long count = jdbcClient.sql("""
                        SELECT COUNT(DISTINCT uo.id)
                        """ + USER_OBJECT_SEARCH_FROM + """
                        WHERE """ + USER_OBJECT_KEYWORD_MATCH)
                .param("userId", userId)
                .param("keyword", keyword)
                .query(Long.class)
                .single();
        return count != null ? count : 0L;
    }

    private List<UserObjectSearchDto> searchUserObjects(
            Long userId,
            String keyword,
            BrandObjectSearchFilter filter) {
        return jdbcClient.sql("""
                        SELECT DISTINCT uo.id, uo.user_id, uo.group_id, g.name AS group_name,
                               uo.brand_object_id, uo.name, uo.image_url, uo.purchase_date,
                               uo.purchase_price, uo.other_notes,
                               bo.name_en AS brand_object_name_en,
                               bo.name_zh AS brand_object_name_zh,
                               br.name_en AS brand_name_en,
                               br.name_zh AS brand_name_zh
                        """ + USER_OBJECT_SEARCH_FROM + """
                        WHERE """ + USER_OBJECT_KEYWORD_MATCH + """
                          AND (:filterCategories = FALSE OR bo.category_id IN (:categoryIds))
                          AND (:filterBrands = FALSE OR bo.brand_id IN (:brandIds))
                          AND (:filterScales = FALSE OR bo.scale_id IN (:scaleIds))
                          AND (:filterSeries = FALSE OR bo.series_id IN (:seriesIds))
                        """)
                .param("userId", userId)
                .param("keyword", keyword)
                .param("filterCategories", filter.filterCategories())
                .param("categoryIds", filter.categoryIdsParam())
                .param("filterBrands", filter.filterBrands())
                .param("brandIds", filter.brandIdsParam())
                .param("filterScales", filter.filterScales())
                .param("scaleIds", filter.scaleIdsParam())
                .param("filterSeries", filter.filterSeries())
                .param("seriesIds", filter.seriesIdsParam())
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
    }

    private List<CategoryFacetDto> toCategoryFacetDtos(
            List<CategoryFacetRow> rows,
            boolean preferZh) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> categoryIds = new HashSet<>();
        for (var row : rows) {
            categoryIds.add(row.categoryId());
        }
        Map<Long, CategoryEntity> categoryById = new HashMap<>();
        categoryRepository.findAllById(categoryIds).forEach(c -> categoryById.put(c.id(), c));
        List<CategoryFacetDto> categories = new ArrayList<>();
        for (var row : rows) {
            CategoryEntity category = categoryById.get(row.categoryId());
            if (category != null && row.cnt() != null) {
                categories.add(CategoryFacetDto.from(category, row.cnt(), preferZh));
            }
        }
        return categories;
    }

    private List<BrandFacetDto> toBrandFacetDtos(List<FacetCountRow> rows, boolean preferZh) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (FacetCountRow row : rows) {
            ids.add(row.id());
        }
        Map<Long, BrandEntity> byId = new HashMap<>();
        brandRepository.findAllById(ids).forEach(b -> byId.put(b.id(), b));
        List<BrandFacetDto> result = new ArrayList<>();
        for (FacetCountRow row : rows) {
            BrandEntity entity = byId.get(row.id());
            if (entity != null && row.cnt() != null) {
                result.add(BrandFacetDto.from(entity, row.cnt(), preferZh));
            }
        }
        return result;
    }

    private List<ScaleFacetDto> toScaleFacetDtos(List<FacetCountRow> rows) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (FacetCountRow row : rows) {
            ids.add(row.id());
        }
        Map<Long, ScaleEntity> byId = new HashMap<>();
        scaleRepository.findAllById(ids).forEach(s -> byId.put(s.id(), s));
        List<ScaleFacetDto> result = new ArrayList<>();
        for (FacetCountRow row : rows) {
            ScaleEntity entity = byId.get(row.id());
            if (entity != null && row.cnt() != null) {
                result.add(ScaleFacetDto.from(entity, row.cnt()));
            }
        }
        return result;
    }

    private List<SeriesFacetDto> toSeriesFacetDtos(List<FacetCountRow> rows, boolean preferZh) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = new HashSet<>();
        for (FacetCountRow row : rows) {
            ids.add(row.id());
        }
        Map<Long, SeriesEntity> byId = new HashMap<>();
        seriesRepository.findAllById(ids).forEach(s -> byId.put(s.id(), s));
        List<SeriesFacetDto> result = new ArrayList<>();
        for (FacetCountRow row : rows) {
            SeriesEntity entity = byId.get(row.id());
            if (entity != null && row.cnt() != null) {
                result.add(SeriesFacetDto.from(entity, row.cnt(), preferZh));
            }
        }
        return result;
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

        deleteReplacedUserImage(userId, groupEntity.imageUrl(), imageUrl);

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

        deleteUserImage(userId, groupEntity.imageUrl());
        userObjectRepository.findByGroupId(groupId)
                .orElse(Collections.emptyList())
                .forEach(uo -> deleteUserImage(userId, uo.imageUrl()));

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

        return jdbcClient.sql("""
                        SELECT uo.id, uo.user_id, uo.group_id, uo.brand_object_id,
                               uo.name, uo.image_url, uo.purchase_date, uo.purchase_price, uo.other_notes
                        FROM user_objects uo
                        LEFT JOIN brand_objects bo ON uo.brand_object_id = bo.id
                        LEFT JOIN brands br ON bo.brand_id = br.id
                        WHERE uo.group_id = :groupId
                          AND uo.user_id = :userId
                          AND (
                            uo.name       ILIKE '%' || :keyword || '%'
                            OR bo.name_en ILIKE '%' || :keyword || '%'
                            OR bo.name_zh ILIKE '%' || :keyword || '%'
                            OR br.name_en ILIKE '%' || :keyword || '%'
                            OR br.name_zh ILIKE '%' || :keyword || '%'
                          )
                        """)
                .param("groupId", groupId)
                .param("userId", userId)
                .param("keyword", keyword.trim())
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

        deleteReplacedUserImage(userId, existing.imageUrl(), imageUrl);

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

        deleteUserImage(userId, userObjectEntity.imageUrl());
        userObjectRepository.deleteById(userObjectId);
    }

    private void deleteReplacedUserImage(long userId, String previousUrl, String newUrl) {
        if (imageStorageService != null) {
            imageStorageService.deleteReplacedUserImage(userId, previousUrl, newUrl);
        }
    }

    private void deleteUserImage(long userId, String imageUrl) {
        if (imageStorageService != null) {
            imageStorageService.deleteUserImageIfOwned(userId, imageUrl);
        }
    }

}
