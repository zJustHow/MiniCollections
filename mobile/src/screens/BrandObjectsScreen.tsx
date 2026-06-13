import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useInfiniteList } from "@minicollections/hooks";
import {
  getBrandObjectsPage,
  searchBrandObjectsByBrandIdPage,
} from "@minicollections/api";
import NeuCard from "../components/neu/NeuCard";
import ScreenHeader from "../components/ScreenHeader";
import SearchField from "../components/SearchField";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useLocale } from "../providers/LocaleProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<BrandsStackParamList, "BrandObjects">;

type BrandObjectItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
  brand?: { name?: string };
};

export default function BrandObjectsScreen({ route, navigation }: Props) {
  const { brandId, brandName } = route.params;
  const { t } = useLocale();
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const searchActive = searchKeyword.trim().length > 0;

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) => {
      if (searchActive) {
        return searchBrandObjectsByBrandIdPage(brandId, searchKeyword, {
          page,
          size,
        });
      }
      return getBrandObjectsPage(brandId, { page, size });
    },
    [brandId, searchActive, searchKeyword],
  );

  const resetKey = `${brandId}:${searchKeyword}`;

  const {
    items,
    loading,
    loadingMore,
    loadError,
    hasMore,
    loadMore,
    refresh,
    retry,
  } = useInfiniteList(fetchPage, { resetKey });

  const objects = items as BrandObjectItem[];

  const runSearch = useCallback(() => {
    setSearchKeyword(draftQuery.trim());
  }, [draftQuery]);

  const clearSearch = useCallback(() => {
    setDraftQuery("");
    setSearchKeyword("");
  }, []);

  const listHeader = useMemo(
    () => (
      <View>
        <ScreenHeader title={brandName} showBack />
        <SearchField
          value={draftQuery}
          onChangeText={setDraftQuery}
          onSubmit={runSearch}
          onClear={searchActive || draftQuery ? clearSearch : undefined}
          placeholder={t("searchModels")}
        />
        {searchActive ? (
          <Text style={styles.searchHint}>
            {t("searchModels")}: {searchKeyword}
          </Text>
        ) : null}
      </View>
    ),
    [
      brandName,
      clearSearch,
      draftQuery,
      runSearch,
      searchActive,
      searchKeyword,
      t,
    ],
  );

  return (
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
            !loading ? (
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
                subtitle={item.brand?.name ?? brandName}
                onPress={() =>
                  navigation.navigate("BrandObjectDetail", {
                    brandId,
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
          ListFooterComponent={<ListFooterSpinner visible={loadingMore} />}
        />
      </SafeAreaView>
    </ListStateBoundary>
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
  searchHint: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
