package com.zjusthow.minicollections.elasticsearch;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(indexName = "brand-objects")
public record BrandObjectDocument(
        @Id Long id,
        @Field(name = "brand_id", type = FieldType.Long) Long brandId,
        @Field(name = "name_en", type = FieldType.Text) String nameEn,
        @Field(name = "name_zh", type = FieldType.Text) String nameZh,
        @Field(name = "image_url", type = FieldType.Keyword) String imageUrl,
        @Field(name = "release_price_cny", type = FieldType.Double) BigDecimal releasePriceCny,
        @Field(name = "release_price_usd", type = FieldType.Double) BigDecimal releasePriceUsd,
        @Field(name = "release_date", type = FieldType.Date) LocalDate releaseDate,
        @Field(name = "category_en", type = FieldType.Text) String categoryEn,
        @Field(name = "category_zh", type = FieldType.Text) String categoryZh,
        @Field(type = FieldType.Keyword) String scale
) {
}
