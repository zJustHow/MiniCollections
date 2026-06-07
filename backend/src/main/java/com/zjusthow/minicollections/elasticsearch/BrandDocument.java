package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandEntity;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

@Document(indexName = "brands")
@Setting(settingPath = "elasticsearch/english-text-settings.json")
public record BrandDocument(
        @Id Long id,
        @Field(name = "name_en", type = FieldType.Text,
               analyzer = "english_text_index", searchAnalyzer = "english_text_search")
        String nameEn,
        @Field(name = "abbreviation", type = FieldType.Keyword, normalizer = "lowercase_normalizer")
        String abbreviation,
        @Field(name = "name_zh", type = FieldType.Text)
        String nameZh,
        @Field(name = "view_count", type = FieldType.Long)
        long viewCount
) {
    public static BrandDocument from(BrandEntity e) {
        return new BrandDocument(
                e.id(),
                e.nameEn(),
                indexAbbreviation(e.abbreviation()),
                e.nameZh(),
                e.viewCount());
    }

    private static String indexAbbreviation(String abbreviation) {
        if (abbreviation == null || abbreviation.isBlank()) {
            return null;
        }
        return abbreviation.trim();
    }
}
