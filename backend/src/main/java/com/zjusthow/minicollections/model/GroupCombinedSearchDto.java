package com.zjusthow.minicollections.model;

import java.util.List;

public record GroupCombinedSearchDto(
        List<GroupDto> groups,
        List<UserObjectSearchDto> objects,
        int page,
        int size,
        long totalGroups,
        long totalObjects,
        long totalElements,
        int totalPages,
        boolean totalExact
) {
    public static GroupCombinedSearchDto empty(int page, int size) {
        return new GroupCombinedSearchDto(
                List.of(),
                List.of(),
                page,
                size,
                0L,
                0L,
                0L,
                0,
                true);
    }
}
