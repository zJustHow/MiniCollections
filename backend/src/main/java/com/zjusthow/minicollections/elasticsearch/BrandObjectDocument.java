package com.zjusthow.minicollections.elasticsearch;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(indexName = "brand-objects")
@Setting(settingPath = "elasticsearch/english-text-settings.json")
public record BrandObjectDocument(
        @Id Long id,
        @Field(name = "name_en", type = FieldType.Text,
               analyzer = "english_text_index", searchAnalyzer = "english_text_search")
        String nameEn,
        @Field(name = "name_zh", type = FieldType.Text) String nameZh,
        @Field(name = "image_url", type = FieldType.Keyword) String imageUrl,
        @Field(name = "release_price_cny", type = FieldType.Double) BigDecimal releasePriceCny,
        @Field(name = "release_price_usd", type = FieldType.Double) BigDecimal releasePriceUsd,
        @Field(name = "release_date", type = FieldType.Date) LocalDate releaseDate,
        @Field(name = "brand_id", type = FieldType.Long) Long brandId,
        @Field(name = "brand_name_en", type = FieldType.Text,
               analyzer = "english_text_index", searchAnalyzer = "english_text_search")
        String brandNameEn,
        @Field(name = "brand_abbreviation", type = FieldType.Keyword, normalizer = "lowercase_normalizer")
        String brandAbbreviation,
        @Field(name = "brand_name_zh", type = FieldType.Text) String brandNameZh,
        @Field(name = "series_id", type = FieldType.Long) Long seriesId,
        @Field(name = "series_en", type = FieldType.Text,
               analyzer = "english_text_index", searchAnalyzer = "english_text_search")
        String seriesEn,
        @Field(name = "series_zh", type = FieldType.Text) String seriesZh,
        @Field(name = "category_id", type = FieldType.Long) Long categoryId,
        @Field(name = "category_en", type = FieldType.Text,
               analyzer = "english_text_index", searchAnalyzer = "english_text_search")
        String categoryEn,
        @Field(name = "category_zh", type = FieldType.Text) String categoryZh,
        @Field(name = "scale_id", type = FieldType.Long) Long scaleId,
        @Field(name = "scale", type = FieldType.Keyword, normalizer = "scale_normalizer") String scale,
        @Field(name = "view_count", type = FieldType.Long) long viewCount
) {
    public static BrandObjectDocument from(
            BrandObjectEntity e,
            String brandNameEn,
            String brandAbbreviation,
            String brandNameZh,
            String seriesEn,
            String seriesZh,
            String categoryEn,
            String categoryZh,
            String scaleCode) {
        return new BrandObjectDocument(
                e.id(),
                e.nameEn(), e.nameZh(), e.imageUrl(),
                e.releasePriceCny(), e.releasePriceUsd(), e.releaseDate(),
                e.brandId(), brandNameEn, indexAbbreviation(brandAbbreviation), brandNameZh,
                e.seriesId(), seriesEn, seriesZh,
                e.categoryId(), categoryEn, categoryZh,
                e.scaleId(), scaleCode,
                e.viewCount()
        );
    }

    private static String indexAbbreviation(String abbreviation) {
        if (abbreviation == null || abbreviation.isBlank()) {
            return null;
        }
        return abbreviation.trim();
    }
}
