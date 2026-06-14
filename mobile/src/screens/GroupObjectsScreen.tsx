import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useDualModeBrowseList } from "@minicollections/hooks";
import {
  getGroupById,
  getGroupObjectOrder,
  getUserObjectsPage,
  reorderGroupObjects,
  searchGroupObjectsPage,
} from "@minicollections/api";
import NeuCard from "../components/neu/NeuCard";
import NeuButton from "../components/neu/NeuButton";
import AddUserObjectSheet from "../components/AddUserObjectSheet";
import EditGroupSheet from "../components/EditGroupSheet";
import ScreenHeader from "../components/ScreenHeader";
import SearchField from "../components/SearchField";
import SortableBrowseList from "../components/SortableBrowseList";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { GroupsStackParamList } from "../navigation/types";
import { openLogin } from "../navigation/openLogin";
import { groupObjectsDeepLink } from "../utils/deepLinks";
import { shareModelLink } from "../utils/shareModel";
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
  });

  const activeList = searchActive ? searchList : browseList;
  const objects = displayItems as UserObjectItem[];

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
        <ScreenHeader
          title={displayName}
          showBack
          rightSlot={
            <View style={styles.headerActions}>
              {!searchActive && !reorderMode ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("addModel")}
                  onPress={() => setAddVisible(true)}
                  style={styles.addBtn}
                >
                  <Text style={styles.addLabel}>+</Text>
                </Pressable>
              ) : null}
              {!searchActive && browseList.sortEnabled ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("sortOrder")}
                  onPress={toggleReorderMode}
                  style={[
                    styles.headerBtn,
                    reorderMode && styles.headerBtnActive,
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
                style={styles.shareBtn}
              >
                <Ionicons name="share-outline" size={22} color={colors.accent} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("editGroup")}
                onPress={() => setEditVisible(true)}
                style={styles.editBtn}
              >
                <Ionicons name="create-outline" size={22} color={colors.accent} />
              </Pressable>
            </View>
          }
        />
        <SearchField
          value={draftQuery}
          onChangeText={setDraftQuery}
          onSubmit={runSearch}
          onClear={searchActive || draftQuery ? clearSearch : undefined}
          placeholder={t("searchModels")}
        />
        {reorderMode ? (
          <Text style={styles.reorderHint}>{t("sortOrder")}</Text>
        ) : null}
      </View>
    ),
    [
      browseList.sortEnabled,
      clearSearch,
      displayName,
      draftQuery,
      reorderMode,
      runSearch,
      searchActive,
      shareGroup,
      t,
      toggleReorderMode,
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
    () => <ListFooterSpinner visible={activeList.loadingMore} />,
    [activeList.loadingMore],
  );

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <ScreenHeader title={displayName} showBack />
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
      loading={activeList.loading && objects.length === 0}
      errorMessage={
        loadErrorMessage(activeList.loadError, objects.length, t("failedToLoadGroupModels"))
      }
      retryLabel={t("retry")}
      onRetry={() => void activeList.retry()}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <SortableBrowseList
          data={objects}
          reorderMode={reorderMode}
          sortEnabled={browseList.sortEnabled}
          reordering={browseList.reordering}
          onMoveItem={browseList.handleDragEnd}
          moveFailedLabel={t("failedToReorder")}
          renderCard={(item) => (
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
          )}
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
        <EditGroupSheet
          visible={editVisible}
          groupId={groupId}
          onClose={() => setEditVisible(false)}
          onUpdated={(name) => setDisplayName(name)}
          onDeleted={() => navigation.goBack()}
        />
        <AddUserObjectSheet
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
  },
  headerBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  shareBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
