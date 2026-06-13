import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteList } from "@minicollections/hooks";
import { getUserObjectsPage, searchGroupObjectsPage } from "@minicollections/api";
import NeuCard from "../components/neu/NeuCard";
import EditGroupSheet from "../components/EditGroupSheet";
import ScreenHeader from "../components/ScreenHeader";
import SearchField from "../components/SearchField";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useLocale } from "../providers/LocaleProvider";
import type { GroupsStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<GroupsStackParamList, "GroupObjects">;

type UserObjectItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
  brand_object?: {
    name?: string;
    brand?: { name?: string };
  };
};

export default function GroupObjectsScreen({ route, navigation }: Props) {
  const { groupId, groupName } = route.params;
  const { t } = useLocale();
  const [displayName, setDisplayName] = useState(groupName);
  const [editVisible, setEditVisible] = useState(false);
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const searchActive = searchKeyword.trim().length > 0;

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) => {
      if (searchActive) {
        return searchGroupObjectsPage(groupId, searchKeyword, { page, size });
      }
      return getUserObjectsPage(groupId, { page, size });
    },
    [groupId, searchActive, searchKeyword],
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
  } = useInfiniteList(fetchPage, {
    resetKey: `${groupId}:${searchKeyword}`,
  });

  const objects = items as UserObjectItem[];

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
        <ScreenHeader
          title={displayName}
          showBack
          rightSlot={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("editGroup")}
              onPress={() => setEditVisible(true)}
              style={styles.editBtn}
            >
              <Ionicons name="create-outline" size={22} color={colors.accent} />
            </Pressable>
          }
        />
        <SearchField
          value={draftQuery}
          onChangeText={setDraftQuery}
          onSubmit={runSearch}
          onClear={searchActive || draftQuery ? clearSearch : undefined}
          placeholder={t("searchGroups")}
        />
      </View>
    ),
    [clearSearch, displayName, draftQuery, runSearch, searchActive, t],
  );

  return (
    <ListStateBoundary
      loading={loading && objects.length === 0}
      errorMessage={
        loadError && objects.length === 0 ? t("failedToLoadGroupModels") : null
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
                item={{
                  id: item.id,
                  name: item.name ?? item.brand_object?.name,
                  image_url: item.image_url,
                }}
                variant="object"
                subtitle={
                  item.brand_object?.brand?.name ??
                  item.brand_object?.name ??
                  undefined
                }
                onPress={() =>
                  navigation.navigate("GroupObjectDetail", {
                    groupId,
                    objectId: String(item.id),
                    objectName: item.name ?? item.brand_object?.name ?? "",
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
        <EditGroupSheet
          visible={editVisible}
          groupId={groupId}
          onClose={() => setEditVisible(false)}
          onUpdated={(name) => setDisplayName(name)}
          onDeleted={() => navigation.goBack()}
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
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
  editBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
