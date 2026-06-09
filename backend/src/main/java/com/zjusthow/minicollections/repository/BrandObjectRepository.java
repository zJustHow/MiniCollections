package com.zjusthow.minicollections.repository;

import com.zjusthow.minicollections.entity.BrandObjectEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandObjectRepository extends ListCrudRepository<BrandObjectEntity, Long> {

    Optional<List<BrandObjectEntity>> findByBrandId(Long brandId);

    List<BrandObjectEntity> findBySeriesId(Long seriesId);

    List<BrandObjectEntity> findByCategoryId(Long categoryId);

    List<BrandObjectEntity> findByScaleId(Long scaleId);

    @Query("""
            SELECT * FROM brand_objects
            ORDER BY id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<BrandObjectEntity> findPageOrderedById(
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("SELECT COUNT(*) FROM brand_objects")
    long countAll();
    long countByBrandId(@Param("brandId") Long brandId);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId
            ORDER BY id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<BrandObjectEntity> findPageByBrandId(
            @Param("brandId") Long brandId,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
            SELECT bo.* FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE (:filterBrands = FALSE OR bo.brand_id IN (:brandIds))
              AND (:filterCategories = FALSE OR bo.category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR bo.scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR bo.series_id IN (:seriesIds))
              AND (LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(REPLACE(REPLACE(COALESCE(b.name_en, ''), ' ', ''), '-', ''))
                    LIKE '%' || LOWER(REPLACE(REPLACE(:keyword, ' ', ''), '-', '')) || '%'
               OR LOWER(COALESCE(b.abbreviation, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            ORDER BY bo.id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<BrandObjectEntity> searchPage(
            @Param("keyword") String keyword,
            @Param("filterBrands") boolean filterBrands,
            @Param("brandIds") List<Long> brandIds,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
            SELECT COUNT(*) FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE (:filterBrands = FALSE OR bo.brand_id IN (:brandIds))
              AND (:filterCategories = FALSE OR bo.category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR bo.scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR bo.series_id IN (:seriesIds))
              AND (LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(REPLACE(REPLACE(COALESCE(b.name_en, ''), ' ', ''), '-', ''))
                    LIKE '%' || LOWER(REPLACE(REPLACE(:keyword, ' ', ''), '-', '')) || '%'
               OR LOWER(COALESCE(b.abbreviation, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            """)
    long countSearch(
            @Param("keyword") String keyword,
            @Param("filterBrands") boolean filterBrands,
            @Param("brandIds") List<Long> brandIds,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT bo.category_id AS category_id, COUNT(*) AS cnt
            FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE bo.category_id IS NOT NULL
              AND (:filterBrands = FALSE OR bo.brand_id IN (:brandIds))
              AND (:filterCategories = FALSE OR bo.category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR bo.scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR bo.series_id IN (:seriesIds))
              AND (LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(REPLACE(REPLACE(COALESCE(b.name_en, ''), ' ', ''), '-', ''))
                    LIKE '%' || LOWER(REPLACE(REPLACE(:keyword, ' ', ''), '-', '')) || '%'
               OR LOWER(COALESCE(b.abbreviation, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            GROUP BY bo.category_id
            ORDER BY cnt DESC, bo.category_id ASC
            """)
    List<CategoryFacetRow> countByCategorySearch(
            @Param("keyword") String keyword,
            @Param("filterBrands") boolean filterBrands,
            @Param("brandIds") List<Long> brandIds,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT bo.brand_id AS id, COUNT(*) AS cnt
            FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE (:filterBrands = FALSE OR bo.brand_id IN (:brandIds))
              AND (:filterCategories = FALSE OR bo.category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR bo.scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR bo.series_id IN (:seriesIds))
              AND (LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(REPLACE(REPLACE(COALESCE(b.name_en, ''), ' ', ''), '-', ''))
                    LIKE '%' || LOWER(REPLACE(REPLACE(:keyword, ' ', ''), '-', '')) || '%'
               OR LOWER(COALESCE(b.abbreviation, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            GROUP BY bo.brand_id
            ORDER BY cnt DESC, bo.brand_id ASC
            """)
    List<FacetCountRow> countByBrandSearch(
            @Param("keyword") String keyword,
            @Param("filterBrands") boolean filterBrands,
            @Param("brandIds") List<Long> brandIds,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT bo.scale_id AS id, COUNT(*) AS cnt
            FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE bo.scale_id IS NOT NULL
              AND (:filterBrands = FALSE OR bo.brand_id IN (:brandIds))
              AND (:filterCategories = FALSE OR bo.category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR bo.scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR bo.series_id IN (:seriesIds))
              AND (LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(REPLACE(REPLACE(COALESCE(b.name_en, ''), ' ', ''), '-', ''))
                    LIKE '%' || LOWER(REPLACE(REPLACE(:keyword, ' ', ''), '-', '')) || '%'
               OR LOWER(COALESCE(b.abbreviation, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            GROUP BY bo.scale_id
            ORDER BY cnt DESC, bo.scale_id ASC
            """)
    List<FacetCountRow> countByScaleSearch(
            @Param("keyword") String keyword,
            @Param("filterBrands") boolean filterBrands,
            @Param("brandIds") List<Long> brandIds,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT bo.series_id AS id, COUNT(*) AS cnt
            FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE bo.series_id IS NOT NULL
              AND (:filterBrands = FALSE OR bo.brand_id IN (:brandIds))
              AND (:filterCategories = FALSE OR bo.category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR bo.scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR bo.series_id IN (:seriesIds))
              AND (LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(REPLACE(REPLACE(COALESCE(b.name_en, ''), ' ', ''), '-', ''))
                    LIKE '%' || LOWER(REPLACE(REPLACE(:keyword, ' ', ''), '-', '')) || '%'
               OR LOWER(COALESCE(b.abbreviation, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            GROUP BY bo.series_id
            ORDER BY cnt DESC, bo.series_id ASC
            """)
    List<FacetCountRow> countBySeriesSearch(
            @Param("keyword") String keyword,
            @Param("filterBrands") boolean filterBrands,
            @Param("brandIds") List<Long> brandIds,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId
              AND (:filterCategories = FALSE OR category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR series_id IN (:seriesIds))
              AND (:hasKeyword = FALSE OR (
                LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
                OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
              ))
            ORDER BY id ASC
            LIMIT :limit OFFSET :offset
            """)
    List<BrandObjectEntity> searchPageWithinBrand(
            @Param("keyword") String keyword,
            @Param("hasKeyword") boolean hasKeyword,
            @Param("brandId") Long brandId,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query("""
            SELECT COUNT(*) FROM brand_objects
            WHERE brand_id = :brandId
              AND (:filterCategories = FALSE OR category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR series_id IN (:seriesIds))
              AND (:hasKeyword = FALSE OR (
                LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
                OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
              ))
            """)
    long countSearchWithinBrand(
            @Param("keyword") String keyword,
            @Param("hasKeyword") boolean hasKeyword,
            @Param("brandId") Long brandId,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT scale_id AS id, COUNT(*) AS cnt
            FROM brand_objects
            WHERE brand_id = :brandId
              AND scale_id IS NOT NULL
              AND (:filterCategories = FALSE OR category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR series_id IN (:seriesIds))
              AND (:hasKeyword = FALSE OR (
                LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
                OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
              ))
            GROUP BY scale_id
            ORDER BY cnt DESC, scale_id ASC
            """)
    List<FacetCountRow> countByScaleWithinBrandSearch(
            @Param("keyword") String keyword,
            @Param("hasKeyword") boolean hasKeyword,
            @Param("brandId") Long brandId,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT series_id AS id, COUNT(*) AS cnt
            FROM brand_objects
            WHERE brand_id = :brandId
              AND series_id IS NOT NULL
              AND (:filterCategories = FALSE OR category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR series_id IN (:seriesIds))
              AND (:hasKeyword = FALSE OR (
                LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
                OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
              ))
            GROUP BY series_id
            ORDER BY cnt DESC, series_id ASC
            """)
    List<FacetCountRow> countBySeriesWithinBrandSearch(
            @Param("keyword") String keyword,
            @Param("hasKeyword") boolean hasKeyword,
            @Param("brandId") Long brandId,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT category_id AS category_id, COUNT(*) AS cnt
            FROM brand_objects
            WHERE brand_id = :brandId
              AND category_id IS NOT NULL
              AND (:filterCategories = FALSE OR category_id IN (:categoryIds))
              AND (:filterScales = FALSE OR scale_id IN (:scaleIds))
              AND (:filterSeries = FALSE OR series_id IN (:seriesIds))
              AND (:hasKeyword = FALSE OR (
                LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
                OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
              ))
            GROUP BY category_id
            ORDER BY cnt DESC, category_id ASC
            """)
    List<CategoryFacetRow> countByCategoryWithinBrandSearch(
            @Param("keyword") String keyword,
            @Param("hasKeyword") boolean hasKeyword,
            @Param("brandId") Long brandId,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("filterScales") boolean filterScales,
            @Param("scaleIds") List<Long> scaleIds,
            @Param("filterSeries") boolean filterSeries,
            @Param("seriesIds") List<Long> seriesIds);

    @Query("""
            SELECT bo.* FROM brand_objects bo
            JOIN brands b ON b.id = bo.brand_id
            WHERE LOWER(bo.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(bo.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(b.name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(REPLACE(REPLACE(COALESCE(b.name_en, ''), ' ', ''), '-', ''))
                    LIKE '%' || LOWER(REPLACE(REPLACE(:keyword, ' ', ''), '-', '')) || '%'
               OR LOWER(COALESCE(b.abbreviation, '')) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(b.name_zh, '')) LIKE '%' || LOWER(:keyword) || '%'
            """)
    List<BrandObjectEntity> searchByNameOrBrandName(@Param("keyword") String keyword);

    @Query("""
            SELECT * FROM brand_objects
            WHERE brand_id = :brandId
              AND (LOWER(name_en) LIKE '%' || LOWER(:keyword) || '%'
               OR LOWER(COALESCE(name_zh, '')) LIKE '%' || LOWER(:keyword) || '%')
            """)
    List<BrandObjectEntity> searchByNameWithinBrand(@Param("keyword") String keyword, @Param("brandId") Long brandId);

    @Modifying
    @Query("UPDATE brand_objects SET view_count = view_count + :delta WHERE id = :id")
    void incrementViewCount(@Param("id") long id, @Param("delta") long delta);
}
