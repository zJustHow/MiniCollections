import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useDualModeBrowseList } from "@minicollections/hooks";
import {
  getGroupOrder,
  getGroupsPage,
  reorderGroups,
  searchGroupsCombinedPage,
} from "@minicollections/api";
import NeuCard from "../components/NeuCard";
import NeuButton from "../components/NeuButton";
import ListSearchField from "../components/ListSearchField";
import ListSearchSummary from "../components/ListSearchSummary";
import SortableInfiniteBrowseSection from "../components/SortableInfiniteBrowseSection";
import CreateGroupModal from "../components/CreateGroupModal";
import EditGroupModal from "../components/EditGroupModal";
import {
  ListFooterSkeleton,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { NeuCardSkeleton } from "../components/skeleton";
import { INITIAL_SKELETON_ITEMS, isSkeletonItem } from "../utils/skeletonUtils";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { GroupsStackParamList } from "../navigation/types";
import { openLogin } from "../navigation/openLogin";
import { isAddCardItem, withAddCardSlot } from "../utils/listPageUtils";
import { colors, neuControlStyle, spacing } from "@minicollections/theme";
import { LIST_SEARCH_CONTROL_HEIGHT } from "../theme/listSearchStyle";
import { neuText } from "../theme/neuText";

type Props = NativeStackScreenProps<GroupsStackParamList, "GroupsList">;

type GroupItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
  __rowKind?: "group";
};

type SearchObjectItem = {
  id: number | string;
  name?: string;
  image_url?: string | null;
  imageUrl?: string | null;
  group_id?: number | string;
  groupId?: number | string;
  group_name?: string;
  groupName?: string;
  __rowKind: "object";
};

type GroupsListItem = GroupItem | SearchObjectItem;

function isSearchObject(item: GroupsListItem): item is SearchObjectItem {
  return item.__rowKind === "object";
}

export default function GroupsScreen({ navigation }: Props) {
  const { authed } = useAuth();
  const { t } = useLocale();
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const searchActive = searchKeyword.trim().length > 0;

  const fetchSearchPage = useCallback(
    async ({ page, size }: { page: number; size: number }) => {
      const data = await searchGroupsCombinedPage(searchKeyword, { page, size });
      const groups = (Array.isArray(data?.groups) ? data.groups : []).map(
        (group: GroupItem) => ({ ...group, __rowKind: "group" as const }),
      );
      const objects = (Array.isArray(data?.objects) ? data.objects : []).map(
        (object: SearchObjectItem) => ({
          ...object,
          image_url: object.image_url ?? object.imageUrl ?? null,
          __rowKind: "object" as const,
        }),
      );
      return {
        content: [...groups, ...objects],
        total_elements: data?.total_elements ?? 0,
        total_pages: data?.total_pages ?? 0,
        total_exact: data?.total_exact !== false,
      };
    },
    [searchKeyword],
  );

  const { browseList, searchList, displayItems } = useDualModeBrowseList({
    entityKey: "groups",
    searchActive,
    searchKeyword,
    enabled: authed,
    fetchListPage: getGroupsPage,
    fetchSearchPage,
    fetchOrder: getGroupOrder,
    reorder: reorderGroups,
    listResetKey: "groups",
    searchResetKey: "groups-search",
    listOptions: { reservedFirstPageSlots: 1 },
  });

  const activeList = searchActive ? searchList : browseList;
  const groups = withAddCardSlot(
    displayItems as GroupsListItem[],
    !searchActive,
  );
  const showInitialSkeleton = activeList.loading && groups.length === 0;
  const listData = useMemo(
    () =>
      showInitialSkeleton
        ? (INITIAL_SKELETON_ITEMS as GroupsListItem[])
        : groups,
    [showInitialSkeleton, groups],
  );

  const runSearch = useCallback(() => {
    setSearchKeyword(draftQuery.trim());
    setReorderMode(false);
  }, [draftQuery]);

  const clearSearch = useCallback(() => {
    setDraftQuery("");
    setSearchKeyword("");
    setReorderMode(false);
  }, []);

  const openEditGroup = useCallback((groupId: string) => {
    setEditingGroupId(groupId);
    setEditVisible(true);
  }, []);

  const closeEditGroup = useCallback(() => {
    setEditVisible(false);
    setEditingGroupId(null);
  }, []);

  const toggleReorderMode = useCallback(() => {
    setReorderMode((current) => !current);
  }, []);

  const listHeader = useMemo(
    () => (
      <View>
        <View style={styles.searchRow}>
          <ListSearchField
            embedded
            value={draftQuery}
            onChangeText={setDraftQuery}
            onSubmit={runSearch}
            onClear={searchActive || draftQuery ? clearSearch : undefined}
            placeholder={t("searchGroups")}
          />
          {!searchActive && browseList.sortEnabled ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("sortOrder")}
              onPress={toggleReorderMode}
              style={({ pressed }) => [
                styles.headerBtn,
                neuControlStyle({
                  variant: reorderMode ? "primary" : "default",
                  pressed,
                }),
              ]}
            >
              <Ionicons
                name="reorder-three"
                size={22}
                color={reorderMode ? "#fff" : colors.accent}
              />
            </Pressable>
          ) : null}
        </View>
        {reorderMode ? (
          <Text style={styles.reorderHint}>{t("sortOrder")}</Text>
        ) : null}
        {searchActive ? (
          !(activeList.loading && groups.length === 0) ? (
            <ListSearchSummary
              summary={t("searchResultsSummary", {
                count: activeList.totalElements,
                query: searchKeyword,
              })}
            />
          ) : null
        ) : null}
      </View>
    ),
    [
      browseList.sortEnabled,
      clearSearch,
      draftQuery,
      reorderMode,
      runSearch,
      searchActive,
      t,
      toggleReorderMode,
      activeList.loading,
      activeList.totalElements,
      groups.length,
      searchKeyword,
    ],
  );

  const listEmpty = useMemo(
    () =>
      !activeList.loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t("noSearchResults")}</Text>
        </View>
      ) : null,
    [activeList.loading, t],
  );

  const listFooter = useMemo(
    () => <ListFooterSkeleton visible={activeList.loadingMore} variant="catalog" />,
    [activeList.loadingMore],
  );

  if (!authed) {
    return (
      <SafeAreaView style={styles.guest} edges={["left", "right"]}>
        <View style={styles.guestBody}>
          <Text style={styles.guestText}>{t("signIn")}</Text>
          <NeuButton
            title={t("signIn")}
            onPress={() => openLogin(navigation, { returnTab: "GroupsTab" })}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ListStateBoundary
        loading={showInitialSkeleton}
        inlineSkeleton
        errorMessage={
          activeList.loadError && groups.length === 0
            ? t("failedToLoadGroups")
            : null
        }
        retryLabel={t("retry")}
        onRetry={() => void activeList.retry()}
      >
        <SafeAreaView style={styles.safe} edges={["left", "right"]}>
          <SortableInfiniteBrowseSection
            data={listData}
            reorderMode={reorderMode}
            sortEnabled={browseList.sortEnabled}
            reordering={browseList.reordering}
            onMoveItem={browseList.handleDragEnd}
            moveFailedLabel={t("failedToReorder")}
            renderCard={(item) =>
              isSkeletonItem(item) ? (
                <NeuCardSkeleton variant={searchActive ? "object" : "catalog"} />
              ) : isAddCardItem(item) ? (
                <NeuCard
                  add
                  name={t("addGroup")}
                  onPress={() => setCreateVisible(true)}
                />
              ) : isSearchObject(item) ? (
                <NeuCard
                  item={{
                    id: item.id,
                    name: item.name,
                    image_url: item.image_url,
                  }}
                  variant="object"
                  subtitle={item.group_name ?? item.groupName}
                  onPress={() => {
                    const groupId = String(item.group_id ?? item.groupId ?? "");
                    if (!groupId) return;
                    navigation.navigate("GroupObjectDetail", {
                      groupId,
                      objectId: String(item.id),
                      objectName: item.name ?? "",
                    });
                  }}
                />
              ) : (
                <NeuCard
                  item={item}
                  onPress={
                    reorderMode
                      ? undefined
                      : () =>
                          navigation.navigate("GroupObjects", {
                            groupId: String(item.id),
                            groupName: item.name ?? "",
                          })
                  }
                  onLongPress={
                    reorderMode ? undefined : () => openEditGroup(String(item.id))
                  }
                />
              )
            }
            listHeader={listHeader}
            listEmpty={listEmpty}
            listFooter={listFooter}
            refreshControl={listRefreshControl(
              activeList.loading && groups.length > 0,
              () => void (searchActive ? activeList.refresh() : browseList.refreshAll()),
            )}
            onEndReached={() => {
              if (activeList.hasMore && !activeList.loadingMore) {
                void activeList.loadMore();
              }
            }}
          />
        </SafeAreaView>
      </ListStateBoundary>

      <CreateGroupModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={() => void browseList.refreshAll()}
      />

      {editingGroupId ? (
        <EditGroupModal
          visible={editVisible}
          groupId={editingGroupId}
          onClose={closeEditGroup}
          onUpdated={() => void browseList.refreshAll()}
          onDeleted={() => void browseList.refreshAll()}
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  headerBtn: {
    width: LIST_SEARCH_CONTROL_HEIGHT,
    height: LIST_SEARCH_CONTROL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  reorderHint: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
