import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useDualModeBrowseList } from "@minicollections/hooks";
import {
  deleteGroup,
  getGroupById,
  getGroupObjectOrder,
  getUserObjectsPage,
  reorderGroupObjects,
  searchGroupObjectsPage,
} from "@minicollections/api";
import NeuCard from "../components/NeuCard";
import NeuButton from "../components/NeuButton";
import AddUserObjectInGroupModal from "../components/AddUserObjectInGroupModal";
import EditGroupModal from "../components/EditGroupModal";
import GroupObjectsPageHeader from "../components/pageHeaders/GroupObjectsPageHeader";
import ListSearchField from "../components/ListSearchField";
import { useHeaderSlot } from "../hooks/useHeaderSlot";
import SortableInfiniteBrowseSection from "../components/SortableInfiniteBrowseSection";
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
import { groupObjectsDeepLink } from "../utils/deepLinks";
import { isAddCardItem, withAddCardSlot } from "../utils/listPageUtils";
import { shareModelLink } from "../utils/shareModel";
import { colors, neuControlStyle, spacing } from "@minicollections/theme";
import { LIST_SEARCH_CONTROL_HEIGHT } from "../theme/listSearchStyle";
import { neuText } from "../theme/neuText";

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
  const { groupId, groupName: routeGroupName } = route.params;
  const { authed } = useAuth();
  const { t } = useLocale();
  const [displayName, setDisplayName] = useState(routeGroupName?.trim() || "…");
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [reorderMode, setReorderMode] = useState(false);
  const searchActive = searchKeyword.trim().length > 0;

  useEffect(() => {
    if (routeGroupName?.trim()) {
      setDisplayName(routeGroupName.trim());
      return;
    }
    let cancelled = false;
    getGroupById(groupId)
      .then((group) => {
        if (cancelled) return;
        const name =
          typeof group?.name === "string" && group.name.trim()
            ? group.name.trim()
            : null;
        if (name) setDisplayName(name);
      })
      .catch(() => {
        // keep fallback title
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, routeGroupName]);

  const fetchListPage = useCallback(
    ({ page, size }: { page: number; size: number }) =>
      getUserObjectsPage(groupId, { page, size }),
    [groupId],
  );

  const fetchSearchPage = useCallback(
    ({ page, size }: { page: number; size: number }) =>
      searchGroupObjectsPage(groupId, searchKeyword, { page, size }),
    [groupId, searchKeyword],
  );

  const { browseList, searchList, displayItems } = useDualModeBrowseList({
    entityKey: groupId,
    searchActive,
    searchKeyword,
    enabled: authed,
    fetchListPage,
    fetchSearchPage,
    fetchOrder: () => getGroupObjectOrder(groupId),
    reorder: (orderedIds: Array<number | string>) =>
      reorderGroupObjects(groupId, orderedIds),
    listResetKey: "group-objects",
    searchResetKey: "group-objects-search",
    listOptions: { reservedFirstPageSlots: 1 },
  });

  const activeList = searchActive ? searchList : browseList;
  const objects = withAddCardSlot(
    displayItems as UserObjectItem[],
    !searchActive,
  );
  const showInitialSkeleton = activeList.loading && objects.length === 0;
  const listData = useMemo(
    () =>
      showInitialSkeleton
        ? (INITIAL_SKELETON_ITEMS as UserObjectItem[])
        : objects,
    [showInitialSkeleton, objects],
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

  const toggleReorderMode = useCallback(() => {
    setReorderMode((current) => !current);
  }, []);

  const shareGroup = useCallback(async () => {
    try {
      await shareModelLink(displayName, groupObjectsDeepLink(groupId));
    } catch {
      // user dismissed
    }
  }, [displayName, groupId]);

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
            placeholder={t("searchModels")}
          />
          {!searchActive && browseList.sortEnabled ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("sortOrder")}
              onPress={toggleReorderMode}
              style={({ pressed }) => [
                styles.toolbarBtn,
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("share")}
            onPress={() => void shareGroup()}
            style={({ pressed }) => [styles.toolbarBtn, neuControlStyle({ pressed })]}
          >
            <Ionicons name="share-outline" size={22} color={colors.accent} />
          </Pressable>
        </View>
        {reorderMode ? (
          <Text style={styles.reorderHint}>{t("sortOrder")}</Text>
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
      shareGroup,
      t,
      toggleReorderMode,
    ],
  );

  const handleDeleteGroup = useCallback(async () => {
    try {
      await deleteGroup(groupId);
      navigation.navigate("GroupsList");
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : t("failedToDeleteGroup"));
    }
  }, [groupId, navigation, t]);

  useHeaderSlot(
    <GroupObjectsPageHeader
      title={displayName}
      onBack={() => navigation.goBack()}
      onEdit={() => setEditVisible(true)}
      onDelete={handleDeleteGroup}
    />,
    [displayName, handleDeleteGroup, navigation],
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
    () => <ListFooterSkeleton visible={activeList.loadingMore} variant="object" />,
    [activeList.loadingMore],
  );

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
        <View style={styles.guestBody}>
          <Text style={styles.guestText}>{t("signIn")}</Text>
          <NeuButton
            title={t("signIn")}
            onPress={() => openLogin(navigation)}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ListStateBoundary
      loading={showInitialSkeleton}
      inlineSkeleton
      errorMessage={
        loadErrorMessage(activeList.loadError, objects.length, t("failedToLoadGroupModels"))
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
              <NeuCardSkeleton variant="object" />
            ) : isAddCardItem(item) ? (
              <NeuCard
                add
                name={t("addModel")}
                variant="object"
                onPress={() => setAddVisible(true)}
              />
            ) : (
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
                onPress={
                  reorderMode
                    ? undefined
                    : () =>
                        navigation.navigate("GroupObjectDetail", {
                          groupId,
                          objectId: String(item.id),
                          objectName: item.name ?? item.brand_object?.name ?? "",
                        })
                }
              />
            )
          }
          listHeader={listHeader}
          listEmpty={listEmpty}
          listFooter={listFooter}
          refreshControl={listRefreshControl(
            activeList.loading && objects.length > 0,
            () => void (searchActive ? activeList.refresh() : browseList.refreshAll()),
          )}
          onEndReached={() => {
            if (activeList.hasMore && !activeList.loadingMore) {
              void activeList.loadMore();
            }
          }}
        />
        <EditGroupModal
          visible={editVisible}
          groupId={groupId}
          onClose={() => setEditVisible(false)}
          onUpdated={(name) => setDisplayName(name)}
          onDeleted={() => navigation.goBack()}
        />
        <AddUserObjectInGroupModal
          visible={addVisible}
          groupId={groupId}
          onClose={() => setAddVisible(false)}
          onAdded={() => {
            Alert.alert(t("modelAdded"));
            void browseList.refreshAll();
          }}
        />
      </SafeAreaView>
    </ListStateBoundary>
  );
}

function loadErrorMessage(
  loadError: boolean,
  itemCount: number,
  message: string,
) {
  return loadError && itemCount === 0 ? message : null;
}

const styles = StyleSheet.create({
  safe: {
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
  toolbarBtn: {
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
