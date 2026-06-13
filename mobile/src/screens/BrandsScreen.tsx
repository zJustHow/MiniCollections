import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useInfiniteList } from "@minicollections/hooks";
import { getBrandsPage } from "@minicollections/api";
import NeuCard from "../components/neu/NeuCard";
import ScreenHeader from "../components/ScreenHeader";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useLocale } from "../providers/LocaleProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<BrandsStackParamList, "BrandsList">;

type BrandItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
};

export default function BrandsScreen({ navigation }: Props) {
  const { t } = useLocale();

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) =>
      getBrandsPage({ page, size }),
    [],
  );

  const {
    items,
    loading,
    loadingMore,
    loadError,
    hasMore,
    loadMore,
    refresh,
    retry,
  } = useInfiniteList(fetchPage);

  const brands = items as BrandItem[];

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <ScreenHeader title={t("brands")} />
      </View>
    ),
    [t],
  );

  return (
    <ListStateBoundary
      loading={loading && brands.length === 0}
      errorMessage={loadError && brands.length === 0 ? t("failedToLoadBrands") : null}
      retryLabel={t("retry")}
      onRetry={() => void retry()}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <FlashList
          data={brands}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <NeuCard
                item={item}
                onPress={() =>
                  navigation.navigate("BrandObjects", {
                    brandId: String(item.id),
                    brandName: item.name ?? "",
                  })
                }
              />
            </View>
          )}
          onEndReached={() => {
            if (hasMore && !loadingMore) void loadMore();
          }}
          onEndReachedThreshold={0.4}
          refreshControl={listRefreshControl(loading && brands.length > 0, () =>
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
  header: {
    paddingBottom: spacing.sm,
  },
  cell: {
    flex: 1,
  },
});
