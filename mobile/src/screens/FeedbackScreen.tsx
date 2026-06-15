import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FEEDBACK_PAGE_SIZE, getMySubmissionsPage } from "@minicollections/api";
import { useInfiniteList } from "@minicollections/hooks";
import ScreenHeader from "../components/ScreenHeader";
import NeuButton from "../components/NeuButton";
import SubmitObjectModal from "../components/SubmitObjectModal";
import SubmissionDrawer, { type FeedbackItem } from "../components/SubmissionDrawer";
import {
  ListFooterSpinner,
  ListStateBoundary,
  listRefreshControl,
} from "../components/ListStateViews";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { FeedbackStackParamList } from "../navigation/types";
import { openLogin } from "../navigation/openLogin";
import {
  feedbackStatusColor,
  feedbackStatusLabel,
  feedbackTypeLabel,
} from "../utils/feedbackLabels";
import { colors, neuCardStyle, neuControlStyle, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

function formatDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function SubmissionRow({
  item,
  onPress,
}: {
  item: FeedbackItem;
  onPress: () => void;
}) {
  const { t } = useLocale();
  const title =
    item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—";
  const brand = item.brand_name || item.custom_brand_name;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.rowCard, neuCardStyle({ pressed })]}
    >
      <View style={styles.rowTop}>
        <Text style={styles.typePill}>{feedbackTypeLabel(item.submission_type, t)}</Text>
        <Text style={[styles.statusPill, { color: feedbackStatusColor(item.status) }]}>
          {feedbackStatusLabel(item.status, t)}
        </Text>
        <Text style={styles.date}>{formatDate(item.submitted_at)}</Text>
      </View>
      <Text style={styles.rowTitle} numberOfLines={2}>
        {title}
      </Text>
      {brand ? (
        <Text style={styles.rowMeta} numberOfLines={1}>
          {brand}
        </Text>
      ) : null}
      {item.notes ? (
        <Text style={styles.rowNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function FeedbackScreen() {
  const { authed } = useAuth();
  const { t } = useLocale();
  const route = useRoute<RouteProp<FeedbackStackParamList, "FeedbackHome">>();
  const navigation = useNavigation<NativeStackNavigationProp<FeedbackStackParamList, "FeedbackHome">>();

  const [submitVisible, setSubmitVisible] = useState(false);
  const [seedBrandId, setSeedBrandId] = useState<string | null>(null);
  const [seedBrandName, setSeedBrandName] = useState<string | null>(null);
  const [seedSubmissionType, setSeedSubmissionType] =
    useState<"MISSING_MODEL" | "BUG_REPORT" | "DATA_CORRECTION">("MISSING_MODEL");
  const [seedNameEn, setSeedNameEn] = useState("");
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    const params = route.params;
    if (!params?.openSubmit) return;
    setSeedBrandId(params.brandId ?? null);
    setSeedBrandName(params.brandName ?? null);
    setSeedSubmissionType(params.submissionType ?? "MISSING_MODEL");
    setSeedNameEn(params.initialNameEn ?? "");
    setSubmitVisible(true);
    navigation.setParams({
      openSubmit: undefined,
      brandId: undefined,
      brandName: undefined,
      submissionType: undefined,
      initialNameEn: undefined,
    });
  }, [navigation, route.params]);

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) =>
      getMySubmissionsPage({ page, size }),
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
  } = useInfiniteList(fetchPage, {
    enabled: authed,
    pageSize: FEEDBACK_PAGE_SIZE,
    resetKey: authed ? "feedback" : "guest",
  });

  const submissions = items as FeedbackItem[];

  const listHeader = useMemo(
    () => (
      <ScreenHeader
        title={t("feedback")}
        rightSlot={
          authed ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setSubmitVisible(true)}
              style={({ pressed }) => [styles.addBtn, neuControlStyle({ pressed })]}
            >
              <Text style={styles.addLabel}>+</Text>
            </Pressable>
          ) : null
        }
      />
    ),
    [authed, t],
  );

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScreenHeader title={t("feedback")} />
        <View style={styles.guestBody}>
          <Text style={styles.guestText}>{t("signIn")}</Text>
          <NeuButton
            title={t("signIn")}
            onPress={() => openLogin(navigation, { returnTab: "FeedbackTab" })}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ListStateBoundary
        loading={loading && submissions.length === 0}
        errorMessage={
          loadError && submissions.length === 0 ? t("failedToLoadMySubmissions") : null
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
              <SubmissionRow item={item} onPress={() => setSelectedItem(item)} />
            )}
            onEndReached={() => {
              if (hasMore && !loadingMore) void loadMore();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={listRefreshControl(loading && submissions.length > 0, () =>
              void refresh(),
            )}
            ListFooterComponent={<ListFooterSpinner visible={loadingMore} />}
          />
        </SafeAreaView>
      </ListStateBoundary>

      <SubmitObjectModal
        visible={submitVisible}
        onClose={() => {
          setSubmitVisible(false);
          setSeedBrandId(null);
          setSeedBrandName(null);
          setSeedSubmissionType("MISSING_MODEL");
          setSeedNameEn("");
        }}
        onSubmitted={() => {
          Alert.alert(t("submissionSubmitted"));
          void refresh();
        }}
        initialBrandId={seedBrandId}
        initialBrandName={seedBrandName}
        initialSubmissionType={seedSubmissionType}
        initialNameEn={seedNameEn}
      />
      <SubmissionDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDeleted={() => {
          Alert.alert(t("feedbackDeleted"));
          void refresh();
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
  addBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    ...neuText.fabAction,
    color: colors.accent,
    lineHeight: 30,
  },
  rowCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  typePill: {
    ...neuText.badge,
    color: colors.accent,
  },
  statusPill: {
    ...neuText.badge,
  },
  date: {
    marginLeft: "auto",
    fontSize: 11,
    color: colors.textSecondary,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: neuText.body.fontWeight,
    color: colors.text,
  },
  rowMeta: {
    ...neuText.bodySecondary,
  },
  rowNotes: {
    ...neuText.bodySecondary,
    lineHeight: 18,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
