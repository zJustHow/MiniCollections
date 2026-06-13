import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useInfiniteList } from "@minicollections/hooks";
import { getGroupsPage, searchGroupsListPage } from "@minicollections/api";
import NeuCard from "../components/neu/NeuCard";
import NeuButton from "../components/neu/NeuButton";
import ScreenHeader from "../components/ScreenHeader";
import SearchField from "../components/SearchField";
import CreateGroupSheet from "../components/CreateGroupSheet";
import EditGroupSheet from "../components/EditGroupSheet";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { GroupsStackParamList, RootStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<GroupsStackParamList, "GroupsList">;

type Navigation = CompositeNavigationProp<
  NativeStackNavigationProp<GroupsStackParamList, "GroupsList">,
  NativeStackNavigationProp<RootStackParamList>
>;

type GroupItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
};

export default function GroupsScreen({ navigation }: Props) {
  const { authed } = useAuth();
  const { t } = useLocale();
  const rootNavigation = navigation.getParent()?.getParent() as Navigation | undefined;
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const searchActive = searchKeyword.trim().length > 0;

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) => {
      if (searchActive) {
        return searchGroupsListPage(searchKeyword, { page, size });
      }
      return getGroupsPage({ page, size });
    },
    [searchActive, searchKeyword],
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
    enabled: authed,
    resetKey: searchActive ? `search:${searchKeyword}` : "browse",
  });

  const groups = items as GroupItem[];

  const runSearch = useCallback(() => {
    setSearchKeyword(draftQuery.trim());
  }, [draftQuery]);

  const clearSearch = useCallback(() => {
    setDraftQuery("");
    setSearchKeyword("");
  }, []);

  const openEditGroup = useCallback((groupId: string) => {
    setEditingGroupId(groupId);
    setEditVisible(true);
  }, []);

  const closeEditGroup = useCallback(() => {
    setEditVisible(false);
    setEditingGroupId(null);
  }, []);

  const listHeader = useMemo(
    () => (
      <View>
        <ScreenHeader
          title={t("groups")}
          rightSlot={
            <Pressable
              accessibilityRole="button"
              onPress={() => setCreateVisible(true)}
              style={styles.addBtn}
            >
              <Text style={styles.addLabel}>+</Text>
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
    [clearSearch, draftQuery, runSearch, searchActive, t],
  );

  if (!authed) {
    return (
      <SafeAreaView style={styles.guest} edges={["top", "left", "right"]}>
        <ScreenHeader title={t("groups")} />
        <View style={styles.guestBody}>
          <Text style={styles.guestText}>{t("signIn")}</Text>
          <NeuButton
            title={t("signIn")}
            onPress={() => rootNavigation?.navigate("Login")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ListStateBoundary
        loading={loading && groups.length === 0}
        errorMessage={
          loadError && groups.length === 0 ? t("failedToLoadGroups") : null
        }
        retryLabel={t("retry")}
        onRetry={() => void retry()}
      >
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <FlashList
            data={groups}
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
                  onPress={() =>
                    navigation.navigate("GroupObjects", {
                      groupId: String(item.id),
                      groupName: item.name ?? "",
                    })
                  }
                  onLongPress={() => openEditGroup(String(item.id))}
                />
              </View>
            )}
            onEndReached={() => {
              if (hasMore && !loadingMore) void loadMore();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={listRefreshControl(loading && groups.length > 0, () =>
              void refresh(),
            )}
            ListFooterComponent={<ListFooterSpinner visible={loadingMore} />}
          />
        </SafeAreaView>
      </ListStateBoundary>

      <CreateGroupSheet
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={() => void refresh()}
      />

      {editingGroupId ? (
        <EditGroupSheet
          visible={editVisible}
          groupId={editingGroupId}
          onClose={closeEditGroup}
          onUpdated={() => void refresh()}
          onDeleted={() => void refresh()}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  guest: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  guestBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  guestText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  cell: {
    flex: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    fontSize: 28,
    fontWeight: "300",
    color: colors.accent,
    lineHeight: 30,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
