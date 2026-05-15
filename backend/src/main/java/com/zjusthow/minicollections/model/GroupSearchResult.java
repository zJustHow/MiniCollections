package com.zjusthow.minicollections.model;

import java.util.List;

public record GroupSearchResult(
        List<GroupDto> groups,
        List<UserObjectSearchDto> objects
) {}
