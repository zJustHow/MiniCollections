package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandEntity;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

@Document(indexName = "brands")
@Setting(settingPath = "elasticsearch/brand-name-settings.json")
public record BrandDocument(
        @Id Long id,
        @Field(name = "name_en", type = FieldType.Text,
               analyzer = "brand_name_index", searchAnalyzer = "brand_name_search")
        String nameEn,
        @Field(name = "name_zh", type = FieldType.Text)
        String nameZh,
        @Field(name = "view_count", type = FieldType.Long)
        long viewCount
) {
    public static BrandDocument from(BrandEntity e) {
        return new BrandDocument(e.id(), e.nameEn(), e.nameZh(), e.viewCount());
    }
}
