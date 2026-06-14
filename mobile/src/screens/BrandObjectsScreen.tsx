import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteList } from "@minicollections/hooks";
import {
  getBrandByBrandId,
  getBrandObjectsPage,
  recordBrandView,
  searchBrandObjectsByBrandIdFacets,
  searchBrandObjectsByBrandIdPage,
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
import { useBrandObjectSearchFilters } from "../hooks/useBrandObjectSearchFilters";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";
import { trackBrandViewOnce } from "../utils/viewTracking";

type Props = NativeStackScreenProps<BrandsStackParamList, "BrandObjects">;

type BrandObjectItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
  brand?: { name?: string };
};

export default function BrandObjectsScreen({ route, navigation }: Props) {
  const { brandId, brandName: routeBrandName } = route.params;
  const { authed, isAdmin } = useAuth();
  const { t } = useLocale();
  const [brandTitle, setBrandTitle] = useState(routeBrandName?.trim() || "…");
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const searchActive = searchKeyword.trim().length > 0;

  const {
    categoryIds,
    scaleIds,
    seriesIds,
    filterKey,
    filterOptions,
    activeCount,
    clearFilters,
    toggleCategory,
    toggleScale,
    toggleSeries,
  } = useBrandObjectSearchFilters();

  useEffect(() => {
    trackBrandViewOnce(brandId, isAdmin, recordBrandView);
  }, [brandId, isAdmin]);

  useEffect(() => {
    if (routeBrandName?.trim()) {
      setBrandTitle(routeBrandName.trim());
      return;
    }
    let cancelled = false;
    getBrandByBrandId(brandId)
      .then((brand) => {
        if (cancelled) return;
        const name =
          typeof brand?.name === "string" && brand.name.trim()
            ? brand.name.trim()
            : null;
        if (name) setBrandTitle(name);
      })
      .catch(() => {
        // keep fallback title
      });
    return () => {
      cancelled = true;
    };
  }, [brandId, routeBrandName]);

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) => {
      if (searchActive) {
        return searchBrandObjectsByBrandIdPage(brandId, searchKeyword, {
          page,
          size,
          ...filterOptions,
        });
      }
      return getBrandObjectsPage(brandId, { page, size });
    },
    [brandId, filterOptions, searchActive, searchKeyword],
  );

  const resetKey = searchActive
    ? `${brandId}:${searchKeyword}:${filterKey}`
    : brandId;

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
  } = useInfiniteList(fetchPage, { resetKey });

  const objects = items as BrandObjectItem[];

  useEffect(() => {
    if (!searchActive) {
      setFacets(null);
      setFacetsLoading(false);
      return;
    }

    let cancelled = false;
    setFacetsLoading(true);
    searchBrandObjectsByBrandIdFacets(brandId, searchKeyword, filterOptions)
      .then((data) => {
        if (!cancelled) setFacets((data as SearchFacets) ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setFacets({
            categories: [],
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
  }, [brandId, filterKey, filterOptions, searchActive, searchKeyword]);

  const runSearch = useCallback(() => {
    clearFilters();
    setSearchKeyword(draftQuery.trim());
  }, [clearFilters, draftQuery]);

  const clearSearch = useCallback(() => {
    setDraftQuery("");
    setSearchKeyword("");
    clearFilters();
  }, [clearFilters]);

  const openMissingModelReport = useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "FeedbackTab",
        params: {
          screen: "FeedbackHome",
          params: {
            openSubmit: true,
            brandId,
            brandName: brandTitle,
            submissionType: "MISSING_MODEL",
          },
        },
      }),
    );
  }, [brandId, brandTitle, navigation]);

  const listFooter = useMemo(
    () => (
      <View style={styles.footer}>
        <ListFooterSpinner visible={loadingMore} />
        {authed ? (
          <Pressable
            accessibilityRole="button"
            onPress={openMissingModelReport}
            style={styles.reportLinkWrap}
          >
            <Text style={styles.reportLink}>{t("reportFeedback")}</Text>
          </Pressable>
        ) : null}
      </View>
    ),
    [authed, loadingMore, openMissingModelReport, t],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <ScreenHeader title={brandTitle} showBack />
        <SearchField
          value={draftQuery}
          onChangeText={setDraftQuery}
          onSubmit={runSearch}
          onClear={searchActive || draftQuery ? clearSearch : undefined}
          placeholder={t("searchModels")}
        />
        {searchActive ? (
          <View style={styles.searchMetaRow}>
            {!(loading && objects.length === 0) ? (
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
      brandTitle,
      clearSearch,
      draftQuery,
      loading,
      objects.length,
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
        loading={loading && objects.length === 0}
        errorMessage={
          loadError && objects.length === 0 ? t("failedToLoadModels") : null
        }
        retryLabel={t("retry")}
        onRetry={() => void retry()}
      >
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <FlashList
            data={objects}
            numColumns={2}
            keyExtractor={(item) => String(item.id)}
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
                <NeuCard
                  item={item}
                  variant="object"
                  subtitle={item.brand?.name ?? brandTitle}
                  onPress={() =>
                    navigation.navigate("BrandObjectDetail", {
                      brandId,
                      brandName: brandTitle,
                      objectId: String(item.id),
                      objectName: item.name ?? "",
                    })
                  }
                />
              </View>
            )}
            onEndReached={() => {
              if (hasMore && !loadingMore) void loadMore();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={listRefreshControl(loading && objects.length > 0, () =>
              void refresh(),
            )}
            ListFooterComponent={listFooter}
          />
        </SafeAreaView>
      </ListStateBoundary>

      <SearchFiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        facets={facets}
        loading={facetsLoading}
        categoryIds={categoryIds}
        brandIds={[]}
        scaleIds={scaleIds}
        seriesIds={seriesIds}
        onToggleCategory={toggleCategory}
        onToggleBrand={() => {}}
        onToggleScale={toggleScale}
        onToggleSeries={toggleSeries}
        onClearFilters={clearFilters}
        showBrands={false}
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
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  reportLinkWrap: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    marginHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  reportLink: {
    color: colors.textSecondary,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
