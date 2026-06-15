import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useInfiniteList } from "@minicollections/hooks";
import {
  getBrandsPage,
  searchBrandObjectsFacets,
  searchBrandsCombinedPage,
} from "@minicollections/api";
import NeuCard from "../components/NeuCard";
import BrandModal from "../components/BrandModal";
import SearchSectionDivider from "../components/SearchSectionDivider";
import ListSearchField from "../components/ListSearchField";
import ListSearchFilterBar from "../components/ListSearchFilterBar";
import ListSearchSummary from "../components/ListSearchSummary";
import ObjectSearchFilterPanel, { type SearchFacets } from "../components/ObjectSearchFilterPanel";
import {
  ListFooterSkeleton,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { NeuCardSkeleton } from "../components/skeleton";
import { INITIAL_SKELETON_ITEMS, isSkeletonItem } from "../utils/skeletonUtils";
import { useObjectFilters } from "../hooks/useObjectFilters";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { pickBrandName } from "../utils/displayLocale";
import { resolveFilterColumnState } from "../utils/objectFilterUtils";
import {
  isAddCardItem,
  isSearchSectionDivider,
  listBrowseContentStyle,
  listBrowseHeaderStyle,
  type SearchSectionDividerItem,
  withAddCardSlot,
  withBrandObjectSearchDivider,
} from "../utils/listPageUtils";
import { colors, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<BrandsStackParamList, "BrandsList">;

type BrandItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
  __rowKind?: "brand";
};

type SearchObjectItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
  brand_id?: number | string;
  brandId?: number | string;
  brand?: string;
  brand_name_en?: string;
  brand_name_zh?: string;
  __rowKind: "object";
};

type BrandsListItem = BrandItem | SearchObjectItem | SearchSectionDividerItem;

function isSearchObject(item: BrandsListItem): item is SearchObjectItem {
  return item.__rowKind === "object";
}

export default function BrandsScreen({ navigation }: Props) {
  const { isAdmin } = useAuth();
  const { t, locale } = useLocale();
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const searchActive = searchKeyword.trim().length > 0;

  const {
    categoryIds,
    brandIds,
    scaleIds,
    seriesIds,
    filterKey,
    activeCount,
    clearFilters,
    toggleCategory,
    toggleBrand,
    toggleScale,
    toggleSeries,
  } = useObjectFilters();

  const filterOptions = useMemo(
    () => ({
      ...(categoryIds.length ? { categoryIds } : {}),
      ...(brandIds.length ? { brandIds } : {}),
      ...(scaleIds.length ? { scaleIds } : {}),
      ...(seriesIds.length ? { seriesIds } : {}),
    }),
    [brandIds, categoryIds, scaleIds, seriesIds],
  );

  const fetchPage = useCallback(
    async ({ page, size }: { page: number; size: number }) => {
      if (searchActive) {
        const data = (await searchBrandsCombinedPage(searchKeyword, {
          page,
          size,
          ...filterOptions,
        })) as {
          brands?: BrandItem[];
          objects?: SearchObjectItem[];
          total_elements?: number;
          total_pages?: number;
          total_exact?: boolean;
        };
        const brands = (Array.isArray(data?.brands) ? data.brands : []).map(
          (brand: BrandItem) => ({ ...brand, __rowKind: "brand" as const }),
        );
        const objects = (Array.isArray(data?.objects) ? data.objects : []).map(
          (object: SearchObjectItem) => ({ ...object, __rowKind: "object" as const }),
        );
        return {
          content: [...brands, ...objects],
          total_elements: data?.total_elements ?? 0,
          total_pages: data?.total_pages ?? 0,
          total_exact: data?.total_exact !== false,
        };
      }
      return getBrandsPage({ page, size });
    },
    [filterOptions, searchActive, searchKeyword],
  );

  const {
    items,
    totalElements,
    loading,
    loadingMore,
    loadError,
    hasMore,
    loadMore,
    refresh,
    retry,
  } = useInfiniteList(fetchPage, {
    resetKey: searchActive ? `search:${searchKeyword}:${filterKey}` : "browse",
    reservedFirstPageSlots: !searchActive && isAdmin ? 1 : 0,
  });

  const rows = withAddCardSlot(
    items as BrandsListItem[],
    isAdmin && !searchActive,
  );
  const showInitialSkeleton = loading && rows.length === 0;
  const listData = useMemo(() => {
    if (showInitialSkeleton) {
      return INITIAL_SKELETON_ITEMS as BrandsListItem[];
    }
    return withBrandObjectSearchDivider(rows, searchActive);
  }, [rows, searchActive, showInitialSkeleton]);

  useEffect(() => {
    if (!searchActive) {
      setFacets(null);
      setFacetsLoading(false);
      return;
    }

    let cancelled = false;
    setFacetsLoading(true);
    searchBrandObjectsFacets(searchKeyword, filterOptions)
      .then((data) => {
        if (!cancelled) setFacets((data as SearchFacets) ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setFacets({
            categories: [],
            brands: [],
            scales: [],
            series: [],
          });
        }
      })
      .finally(() => {
        if (!cancelled) setFacetsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterKey, filterOptions, searchActive, searchKeyword]);

  const runSearch = useCallback(() => {
    clearFilters();
    setSearchKeyword(draftQuery.trim());
  }, [clearFilters, draftQuery]);

  const clearSearch = useCallback(() => {
    setDraftQuery("");
    setSearchKeyword("");
    clearFilters();
  }, [clearFilters]);

  const { showFilterColumn } = resolveFilterColumnState({
    searchActive,
    searchKeyword,
    searchFacets: facets,
    facetsLoading,
    includeBrands: true,
  });

  const searchSummary =
    searchActive && !(loading && rows.length === 0)
      ? t("searchResultsSummary", {
          count: totalElements,
          query: searchKeyword,
        })
      : null;

  const listHeader = useMemo(
    () => (
      <View>
        <ListSearchField
          value={draftQuery}
          onChangeText={setDraftQuery}
          onSubmit={runSearch}
          onClear={searchActive || draftQuery ? clearSearch : undefined}
          placeholder={t("searchBrandsAndObjects")}
        />
        {searchActive && showFilterColumn ? (
          <ListSearchFilterBar
            summary={searchSummary}
            summaryLoading={loading && rows.length === 0}
            filterLabel={t("searchFilters")}
            activeFilterCount={activeCount}
            onOpenFilters={() => setFiltersVisible(true)}
          />
        ) : searchSummary ? (
          <ListSearchSummary summary={searchSummary} />
        ) : null}
      </View>
    ),
    [
      activeCount,
      clearSearch,
      draftQuery,
      loading,
      rows.length,
      runSearch,
      searchActive,
      searchSummary,
      showFilterColumn,
      t,
    ],
  );

  return (
    <>
      <ListStateBoundary
        loading={showInitialSkeleton}
        inlineSkeleton
        errorMessage={loadError && rows.length === 0 ? t("failedToLoadBrands") : null}
        retryLabel={t("retry")}
        onRetry={() => void retry()}
      >
        <SafeAreaView style={styles.safe} edges={["left", "right"]}>
          <FlashList
            data={listData}
            numColumns={2}
            getItemType={(item) =>
              isSearchSectionDivider(item) ? "divider" : "card"
            }
            overrideItemLayout={(layout, item, _index, maxColumns) => {
              if (isSearchSectionDivider(item)) {
                layout.span = maxColumns;
              }
            }}
            keyExtractor={(item) =>
              isSkeletonItem(item)
                ? String(item.id)
                : isSearchSectionDivider(item)
                  ? item.id
                  : `${isSearchObject(item) ? "object" : "brand"}:${String(item.id)}`
            }
            contentContainerStyle={listBrowseContentStyle}
            ListHeaderComponent={listHeader}
            ListHeaderComponentStyle={listBrowseHeaderStyle}
            ListEmptyComponent={
              !loading && searchActive ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>{t("noSearchResults")}</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              if (isSearchSectionDivider(item)) {
                return (
                  <View style={styles.dividerCell}>
                    <SearchSectionDivider />
                  </View>
                );
              }

              return (
              <View style={styles.cell}>
                {isSkeletonItem(item) ? (
                  <NeuCardSkeleton variant={searchActive ? "object" : "catalog"} />
                ) : isAddCardItem(item) ? (
                  <NeuCard
                    add
                    name={t("addBrand")}
                    variant="brand"
                    onPress={() => setBrandModalVisible(true)}
                  />
                ) : isSearchObject(item) ? (
                  <NeuCard
                    item={item}
                    variant="object"
                    subtitle={pickBrandName(item, locale) ?? undefined}
                    onPress={() => {
                      const brandId = String(item.brand_id ?? item.brandId ?? "");
                      if (!brandId) return;
                      navigation.navigate("BrandObjectDetail", {
                        brandId,
                        brandName: pickBrandName(item, locale) ?? undefined,
                        objectId: String(item.id),
                        objectName: item.name ?? "",
                      });
                    }}
                  />
                ) : (
                  <NeuCard
                    item={item}
                    variant="brand"
                    onPress={() =>
                      navigation.navigate("BrandObjects", {
                        brandId: String(item.id),
                        brandName: item.name ?? "",
                      })
                    }
                  />
                )}
              </View>
              );
            }}
            onEndReached={() => {
              if (hasMore && !loadingMore) void loadMore();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={listRefreshControl(loading && rows.length > 0, () =>
              void refresh(),
            )}
            ListFooterComponent={
              <ListFooterSkeleton visible={loadingMore} variant="catalog" />
            }
          />
        </SafeAreaView>
      </ListStateBoundary>

      <ObjectSearchFilterPanel
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        facets={facets}
        loading={facetsLoading}
        categoryIds={categoryIds}
        brandIds={brandIds}
        scaleIds={scaleIds}
        seriesIds={seriesIds}
        onToggleCategory={toggleCategory}
        onToggleBrand={toggleBrand}
        onToggleScale={toggleScale}
        onToggleSeries={toggleSeries}
      />

      <BrandModal
        visible={brandModalVisible}
        onClose={() => setBrandModalVisible(false)}
        onSuccess={() => void refresh()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  cell: {
    flex: 1,
  },
  dividerCell: {
    width: "100%",
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
