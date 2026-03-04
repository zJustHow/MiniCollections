package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.BrandEntity;
import com.zjusthow.minicollections.entity.GroupEntity;

import java.util.List;

public record GroupDto (
        Long id,
        String name,
        String imageUrl,
        List<UserObjectDto> userObjects
) {

    public GroupDto (GroupEntity groupEntity, List<UserObjectDto> userObjects) {
        this(groupEntity.id(), groupEntity.name(), groupEntity.imageUrl(), userObjects);
    }
}
