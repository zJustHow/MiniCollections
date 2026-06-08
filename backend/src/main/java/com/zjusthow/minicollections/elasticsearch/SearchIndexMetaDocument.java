package com.zjusthow.minicollections.elasticsearch;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "search-index-meta")
public record SearchIndexMetaDocument(
        @Id String indexName,
        @Field(type = FieldType.Integer) int version
) {
}
