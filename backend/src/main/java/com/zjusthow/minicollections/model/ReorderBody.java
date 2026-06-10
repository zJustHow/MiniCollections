package com.zjusthow.minicollections.model;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ReorderBody(@NotEmpty List<Long> orderedIds) {
}
