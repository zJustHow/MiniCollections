package com.zjusthow.minicollections.model;

import com.zjusthow.minicollections.entity.GroupEntity;

public record GroupDto(
        Long id,
        String name,
        String imageUrl
    ) {

    public GroupDto(GroupEntity groupEntity) {
        this(groupEntity.id(), groupEntity.name(), groupEntity.imageUrl());
    }
}
