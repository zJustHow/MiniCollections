import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getCollectionStats } from "@minicollections/api";
import ScreenHeader from "../components/ScreenHeader";
import StatsBarChart from "../components/StatsBarChart";
import NeuButton from "../components/NeuButton";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import { openLogin } from "../navigation/openLogin";
import { colors, neuRaised, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type NamedCount = {
  name_en?: string;
  nameEn?: string;
  name_zh?: string;
  nameZh?: string;
  count: number;
};

type StatsPayload = {
  total_objects?: number;
  totalObjects?: number;
  by_category?: NamedCount[];
  byCategory?: NamedCount[];
  by_brand?: NamedCount[];
  byBrand?: NamedCount[];
  purchase_trend?: Array<{
    date?: string;
    cumulative_total?: number | string;
    cumulativeTotal?: number | string;
  }>;
  purchaseTrend?: Array<{
    date?: string;
    cumulative_total?: number | string;
    cumulativeTotal?: number | string;
  }>;
};

function pickLocalizedName(item: NamedCount, locale: string) {
  const en = item.name_en ?? item.nameEn ?? "";
  const zh = item.name_zh ?? item.nameZh ?? "";
  return locale.startsWith("zh") ? zh || en : en || zh;
}

export default function StatsScreen() {
  const { authed } = useAuth();
  const { t, locale } = useLocale();
  const navigation = useNavigation();

  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCollectionStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("statsLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, [authed, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryItems = useMemo(() => {
    const rows = stats?.by_category ?? stats?.byCategory ?? [];
    return rows.map((item) => ({
      label: pickLocalizedName(item, locale) || "—",
      value: Number(item.count ?? 0),
    }));
  }, [stats, locale]);

  const brandItems = useMemo(() => {
    const rows = stats?.by_brand ?? stats?.byBrand ?? [];
    return rows.map((item) => ({
      label: pickLocalizedName(item, locale) || "—",
      value: Number(item.count ?? 0),
    }));
  }, [stats, locale]);

  const trendRows = stats?.purchase_trend ?? stats?.purchaseTrend ?? [];
  const totalObjects = stats?.total_objects ?? stats?.totalObjects ?? 0;

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScreenHeader title={t("stats")} />
        <View style={styles.centered}>
          <Text style={styles.guest}>{t("signIn")}</Text>
          <NeuButton
            title={t("signIn")}
            onPress={() => openLogin(navigation, { returnTab: "StatsTab" })}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <NeuButton title={t("retry")} onPress={() => void load()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={t("collectionStats")} />
        <Text style={styles.summary}>
          {t("statsTotalObjects")}: {totalObjects}
        </Text>

        <StatsBarChart
          title={t("categoryDistribution")}
          items={categoryItems}
          emptyLabel={t("statsNoCategoryData")}
        />
        <StatsBarChart
          title={t("brandCounts")}
          items={brandItems}
          emptyLabel={t("statsNoBrandData")}
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("purchaseTrend")}</Text>
          {trendRows.length === 0 ? (
            <Text style={styles.empty}>{t("statsNoPurchaseData")}</Text>
          ) : (
            trendRows.slice(-8).map((point) => {
              const total =
                point.cumulative_total ?? point.cumulativeTotal ?? 0;
              return (
                <View key={String(point.date)} style={styles.trendRow}>
                  <Text style={styles.trendDate}>{point.date}</Text>
                  <Text style={styles.trendValue}>{String(total)}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  summary: {
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontWeight: neuText.body.fontWeight,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    ...neuRaised("sm"),
    backgroundColor: colors.bg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  empty: {
    color: colors.textSecondary,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trendDate: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  trendValue: {
    color: colors.text,
    fontWeight: neuText.body.fontWeight,
  },
  guest: {
    color: colors.textSecondary,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
});
