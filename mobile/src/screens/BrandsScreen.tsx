import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteList } from "@minicollections/hooks";
import {
  getBrandsPage,
  searchBrandObjectsFacets,
  searchBrandsCombinedPage,
} from "@minicollections/api";
import NeuCard from "../components/neu/NeuCard";
import ScreenHeader from "../components/ScreenHeader";
import SearchField from "../components/SearchField";
import SearchFiltersSheet, { type SearchFacets } from "../components/SearchFiltersSheet";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useObjectFilters } from "../hooks/useObjectFilters";
import { useLocale } from "../providers/LocaleProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { pickBrandName } from "../utils/displayLocale";
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

type BrandsListItem = BrandItem | SearchObjectItem;

function isSearchObject(item: BrandsListItem): item is SearchObjectItem {
  return item.__rowKind === "object";
}

export default function BrandsScreen({ navigation }: Props) {
  const { t, locale } = useLocale();
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
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
  });

  const rows = items as BrandsListItem[];

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

  const listHeader = useMemo(
    () => (
      <View>
        <ScreenHeader title={t("brands")} />
        <SearchField
          value={draftQuery}
          onChangeText={setDraftQuery}
          onSubmit={runSearch}
          onClear={searchActive || draftQuery ? clearSearch : undefined}
          placeholder={t("searchBrandsAndObjects")}
        />
        {searchActive ? (
          <View style={styles.searchMetaRow}>
            {!(loading && rows.length === 0) ? (
              <Text style={styles.searchHint}>
                {t("searchResultsSummary", {
                  count: totalElements,
                  query: searchKeyword,
                })}
              </Text>
            ) : (
              <View style={styles.searchHintSpacer} />
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => setFiltersVisible(true)}
              style={styles.filterBtn}
            >
              <Ionicons name="options-outline" size={18} color={colors.accent} />
              <Text style={styles.filterBtnLabel}>{t("searchFilters")}</Text>
              {activeCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeLabel}>{activeCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
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
      searchKeyword,
      t,
      totalElements,
    ],
  );

  return (
    <>
      <ListStateBoundary
        loading={loading && rows.length === 0}
        errorMessage={loadError && rows.length === 0 ? t("failedToLoadBrands") : null}
        retryLabel={t("retry")}
        onRetry={() => void retry()}
      >
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <FlashList
            data={rows}
            numColumns={2}
            keyExtractor={(item) =>
              `${isSearchObject(item) ? "object" : "brand"}:${String(item.id)}`
            }
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              !loading && searchActive ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>{t("noSearchResults")}</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.cell}>
                {isSearchObject(item) ? (
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
                    onPress={() =>
                      navigation.navigate("BrandObjects", {
                        brandId: String(item.id),
                        brandName: item.name ?? "",
                      })
                    }
                  />
                )}
              </View>
            )}
            onEndReached={() => {
              if (hasMore && !loadingMore) void loadMore();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={listRefreshControl(loading && rows.length > 0, () =>
              void refresh(),
            )}
            ListFooterComponent={<ListFooterSpinner visible={loadingMore} />}
          />
        </SafeAreaView>
      </ListStateBoundary>

      <SearchFiltersSheet
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
        onClearFilters={clearFilters}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchHint: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  searchHintSpacer: {
    flex: 1,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
  },
  filterBtnLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  cell: {
    flex: 1,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
