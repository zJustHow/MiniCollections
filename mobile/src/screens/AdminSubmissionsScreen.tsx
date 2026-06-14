import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  FEEDBACK_PAGE_SIZE,
  getAdminSubmissionCounts,
  getAdminSubmissionsPage,
} from "@minicollections/api";
import { useInfiniteList } from "@minicollections/hooks";
import ScreenHeader from "../components/ScreenHeader";
import AdminSubmissionDetailSheet, {
  type AdminSubmissionItem,
} from "../components/AdminSubmissionDetailSheet";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { ProfileStackParamList } from "../navigation/types";
import {
  feedbackStatusColor,
  feedbackStatusLabel,
  feedbackTypeLabel,
} from "../utils/feedbackLabels";
import { colors, radius, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "AdminSubmissions">;

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

const STATUS_OPTIONS: StatusFilter[] = ["PENDING", "APPROVED", "REJECTED", "ALL"];

const STATUS_LABEL_KEY: Record<StatusFilter, string> = {
  PENDING: "submissionsPending",
  APPROVED: "submissionsApproved",
  REJECTED: "submissionsRejected",
  ALL: "submissionsAll",
};

function formatDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function AdminSubmissionsScreen({ navigation }: Props) {
  const { isAdmin } = useAuth();
  const { t } = useLocale();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("PENDING");
  const [selectedItem, setSelectedItem] = useState<AdminSubmissionItem | null>(null);
  const [counts, setCounts] = useState<Record<StatusFilter, number>>({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    ALL: 0,
  });

  const loadCounts = useCallback(async () => {
    try {
      const data = await getAdminSubmissionCounts();
      setCounts({
        PENDING: data?.pending ?? 0,
        APPROVED: data?.approved ?? 0,
        REJECTED: data?.rejected ?? 0,
        ALL: data?.total ?? 0,
      });
    } catch {
      // counts are optional UI polish
    }
  }, []);

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) =>
      getAdminSubmissionsPage({
        status: activeStatus,
        page,
        size,
      }),
    [activeStatus],
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
    enabled: isAdmin,
    pageSize: FEEDBACK_PAGE_SIZE,
    resetKey: activeStatus,
  });

  const submissions = items as AdminSubmissionItem[];

  const onRefreshAll = useCallback(async () => {
    await Promise.all([refresh(), loadCounts()]);
  }, [loadCounts, refresh]);

  React.useEffect(() => {
    if (isAdmin) void loadCounts();
  }, [isAdmin, loadCounts, activeStatus]);

  const statusBar = useMemo(
    () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusRow}
      >
        {STATUS_OPTIONS.map((status) => (
          <Pressable
            key={status}
            onPress={() => setActiveStatus(status)}
            style={[styles.statusChip, activeStatus === status && styles.statusChipActive]}
          >
            <Text
              style={[
                styles.statusChipLabel,
                activeStatus === status && styles.statusChipLabelActive,
              ]}
            >
              {t(STATUS_LABEL_KEY[status])} ({counts[status]})
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    ),
    [activeStatus, counts, t],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <ScreenHeader title={t("adminSubmissions")} showBack onBack={() => navigation.goBack()} />
        {statusBar}
      </View>
    ),
    [navigation, statusBar, t],
  );

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScreenHeader title={t("adminPanel")} showBack onBack={() => navigation.goBack()} />
        <View style={styles.denied}>
          <Text style={styles.deniedText}>{t("error.no_permission")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ListStateBoundary
        loading={loading && submissions.length === 0}
        errorMessage={
          loadError && submissions.length === 0 ? t("failedToLoadSubmissions") : null
        }
        retryLabel={t("retry")}
        onRetry={() => void retry()}
      >
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <FlashList
            data={submissions}
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
              <Pressable
                style={styles.rowCard}
                onPress={() => setSelectedItem(item)}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.id}>#{item.id}</Text>
                  <Text style={styles.typePill}>
                    {feedbackTypeLabel(item.submission_type, t)}
                  </Text>
                  <Text
                    style={[styles.statusPill, { color: feedbackStatusColor(item.status) }]}
                  >
                    {feedbackStatusLabel(item.status, t)}
                  </Text>
                </View>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—"}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {item.submitter_name ?? "—"}
                  {item.brand_name || item.custom_brand_name
                    ? ` · ${item.brand_name ?? item.custom_brand_name}`
                    : ""}
                </Text>
                <Text style={styles.date}>{formatDate(item.submitted_at)}</Text>
              </Pressable>
            )}
            onEndReached={() => {
              if (hasMore && !loadingMore) void loadMore();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={listRefreshControl(loading && submissions.length > 0, () =>
              void onRefreshAll(),
            )}
            ListFooterComponent={<ListFooterSpinner visible={loadingMore} />}
          />
        </SafeAreaView>
      </ListStateBoundary>

      <AdminSubmissionDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdated={() => void onRefreshAll()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  denied: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  deniedText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  statusRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
  },
  statusChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.bg,
  },
  statusChipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  statusChipLabelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  rowCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    gap: spacing.xs,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  id: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  typePill: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
  },
  statusPill: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: "auto",
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  rowMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
