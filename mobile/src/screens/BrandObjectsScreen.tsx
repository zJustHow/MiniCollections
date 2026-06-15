import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { useInfiniteList } from "@minicollections/hooks";
import {
  adminDeleteBrand,
  getBrandByBrandId,
  getBrandObjectsPage,
  recordBrandView,
  searchBrandObjectsByBrandIdFacets,
  searchBrandObjectsByBrandIdPage,
} from "@minicollections/api";
import NeuCard from "../components/NeuCard";
import BrandModal from "../components/BrandModal";
import BrandObjectModal from "../components/BrandObjectModal";
import BrandObjectsPageHeader from "../components/pageHeaders/BrandObjectsPageHeader";
import ListSearchField from "../components/ListSearchField";
import ListSearchFilterBar from "../components/ListSearchFilterBar";
import ListSearchSummary from "../components/ListSearchSummary";
import { useHeaderSlot } from "../hooks/useHeaderSlot";
import ObjectSearchFilterPanel, { type SearchFacets } from "../components/ObjectSearchFilterPanel";
import {
  ListFooterSkeleton,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { NeuCardSkeleton } from "../components/skeleton";
import { INITIAL_SKELETON_ITEMS, isSkeletonItem } from "../utils/skeletonUtils";
import { useBrandObjectSearchFilters } from "../hooks/useBrandObjectSearchFilters";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";
import { trackBrandViewOnce } from "../utils/viewTracking";
import { resolveFilterColumnState } from "../utils/objectFilterUtils";
import { isAddCardItem, listBrowseContentStyle, listBrowseHeaderStyle, withAddCardSlot } from "../utils/listPageUtils";

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
  const [brandRecord, setBrandRecord] = useState<Record<string, unknown> | null>(null);
  const [brandEditVisible, setBrandEditVisible] = useState(false);
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const [brandObjectModalVisible, setBrandObjectModalVisible] = useState(false);
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
        setBrandRecord(brand as Record<string, unknown>);
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
  } = useInfiniteList(fetchPage, {
    resetKey,
    reservedFirstPageSlots: !searchActive && isAdmin ? 1 : 0,
  });

  const objects = withAddCardSlot(
    items as BrandObjectItem[],
    isAdmin && !searchActive,
  );
  const showInitialSkeleton = loading && objects.length === 0;
  const listData = useMemo(
    () =>
      showInitialSkeleton
        ? (INITIAL_SKELETON_ITEMS as BrandObjectItem[])
        : objects,
    [showInitialSkeleton, objects],
  );

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

  const { showFilterColumn } = resolveFilterColumnState({
    searchActive,
    searchKeyword,
    searchFacets: facets,
    facetsLoading,
    includeBrands: false,
  });

  const searchSummary =
    searchActive && !(loading && objects.length === 0)
      ? t("searchResultsSummary", {
          count: totalElements,
          query: searchKeyword,
        })
      : null;

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
        <ListFooterSkeleton visible={loadingMore} variant="object" />
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
        <ListSearchField
          value={draftQuery}
          onChangeText={setDraftQuery}
          onSubmit={runSearch}
          onClear={searchActive || draftQuery ? clearSearch : undefined}
          placeholder={t("searchModels")}
        />
        {searchActive && showFilterColumn ? (
          <ListSearchFilterBar
            summary={searchSummary}
            summaryLoading={loading && objects.length === 0}
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
      objects.length,
      runSearch,
      searchActive,
      searchSummary,
      showFilterColumn,
      t,
    ],
  );

  const handleDeleteBrand = useCallback(async () => {
    try {
      await adminDeleteBrand(brandId);
      navigation.goBack();
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : t("failedToDeleteBrand"));
    }
  }, [brandId, navigation, t]);

  useHeaderSlot(
    <BrandObjectsPageHeader
      title={brandTitle}
      onBack={() => navigation.goBack()}
      isAdmin={isAdmin}
      onEditBrand={
        isAdmin && brandRecord
          ? () => setBrandEditVisible(true)
          : undefined
      }
      onDeleteBrand={isAdmin && brandRecord ? handleDeleteBrand : undefined}
    />,
    [brandRecord, brandTitle, handleDeleteBrand, isAdmin, navigation],
  );

  return (
    <>
      <ListStateBoundary
        loading={showInitialSkeleton}
        inlineSkeleton
        errorMessage={
          loadError && objects.length === 0 ? t("failedToLoadModels") : null
        }
        retryLabel={t("retry")}
        onRetry={() => void retry()}
      >
        <SafeAreaView style={styles.safe} edges={["left", "right"]}>
          <FlashList
            data={listData}
            numColumns={2}
            keyExtractor={(item) => String(item.id)}
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
            renderItem={({ item }) => (
              <View style={styles.cell}>
                {isSkeletonItem(item) ? (
                  <NeuCardSkeleton variant="object" />
                ) : isAddCardItem(item) ? (
                  <NeuCard
                    add
                    name={t("addBrandObject")}
                    variant="object"
                    onPress={() => setBrandObjectModalVisible(true)}
                  />
                ) : (
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
                )}
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

      <ObjectSearchFilterPanel
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
        showBrands={false}
      />

      <BrandObjectModal
        visible={brandObjectModalVisible}
        brandId={brandId}
        onClose={() => setBrandObjectModalVisible(false)}
        onSuccess={() => void refresh()}
      />

      <BrandModal
        visible={brandEditVisible}
        brand={
          brandRecord
            ? {
                id: brandId,
                name_en:
                  typeof brandRecord.name_en === "string"
                    ? brandRecord.name_en
                    : undefined,
                name_zh:
                  typeof brandRecord.name_zh === "string"
                    ? brandRecord.name_zh
                    : undefined,
                abbreviation:
                  typeof brandRecord.abbreviation === "string"
                    ? brandRecord.abbreviation
                    : undefined,
                image_url:
                  typeof brandRecord.image_url === "string"
                    ? brandRecord.image_url
                    : typeof brandRecord.imageUrl === "string"
                      ? brandRecord.imageUrl
                      : undefined,
              }
            : null
        }
        onClose={() => setBrandEditVisible(false)}
        onSuccess={() => {
          void getBrandByBrandId(brandId).then((brand) => {
            setBrandRecord(brand as Record<string, unknown>);
            const name =
              typeof brand?.name === "string" && brand.name.trim()
                ? brand.name.trim()
                : null;
            if (name) setBrandTitle(name);
          });
        }}
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
