import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NeuButton from "./neu/NeuButton";
import { useLocale } from "../providers/LocaleProvider";
import { colors, radius, spacing } from "@minicollections/theme";

export type FacetItem = {
  id: number;
  name?: string;
  code?: string;
  count?: number;
};

export type SearchFacets = {
  categories?: FacetItem[];
  brands?: FacetItem[];
  scales?: FacetItem[];
  series?: FacetItem[];
};

type SearchFiltersSheetProps = {
  visible: boolean;
  onClose: () => void;
  facets: SearchFacets | null;
  loading: boolean;
  categoryIds: number[];
  brandIds: number[];
  scaleIds: number[];
  seriesIds: number[];
  onToggleCategory: (id: number) => void;
  onToggleBrand: (id: number) => void;
  onToggleScale: (id: number) => void;
  onToggleSeries: (id: number) => void;
  onClearFilters: () => void;
  showBrands?: boolean;
};

function formatFacetCount(count?: number) {
  const n = Number(count);
  if (!Number.isFinite(n)) return "";
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function FilterChip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count?: number;
  selected: boolean;
  onPress: () => void;
}) {
  const countLabel = formatFacetCount(count);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelActive]} numberOfLines={2}>
        {label}
        {countLabel ? ` (${countLabel})` : ""}
      </Text>
    </Pressable>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

export default function SearchFiltersSheet({
  visible,
  onClose,
  facets,
  loading,
  categoryIds,
  brandIds,
  scaleIds,
  seriesIds,
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
  onToggleSeries,
  onClearFilters,
  showBrands = true,
}: SearchFiltersSheetProps) {
  const { t } = useLocale();

  const hasCategories = (facets?.categories?.length ?? 0) > 0;
  const hasBrands = showBrands && (facets?.brands?.length ?? 0) > 0;
  const hasScales = (facets?.scales?.length ?? 0) > 0;
  const hasSeries = (facets?.series?.length ?? 0) > 0;
  const hasFacets = hasCategories || hasBrands || hasScales || hasSeries;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("searchFilters")}</Text>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : !hasFacets ? (
            <Text style={styles.empty}>{t("noSearchResults")}</Text>
          ) : (
            <ScrollView contentContainerStyle={styles.content}>
              {hasCategories ? (
                <FilterSection title={t("category")}>
                  {facets?.categories?.map((item) => (
                    <FilterChip
                      key={`cat-${item.id}`}
                      label={item.name ?? String(item.id)}
                      count={item.count}
                      selected={categoryIds.includes(item.id)}
                      onPress={() => onToggleCategory(item.id)}
                    />
                  ))}
                </FilterSection>
              ) : null}

              {hasBrands ? (
                <FilterSection title={t("brands")}>
                  {facets?.brands?.map((item) => (
                    <FilterChip
                      key={`brand-${item.id}`}
                      label={item.name ?? String(item.id)}
                      count={item.count}
                      selected={brandIds.includes(item.id)}
                      onPress={() => onToggleBrand(item.id)}
                    />
                  ))}
                </FilterSection>
              ) : null}

              {hasSeries ? (
                <FilterSection title={t("series")}>
                  {facets?.series?.map((item) => (
                    <FilterChip
                      key={`series-${item.id}`}
                      label={item.name ?? String(item.id)}
                      count={item.count}
                      selected={seriesIds.includes(item.id)}
                      onPress={() => onToggleSeries(item.id)}
                    />
                  ))}
                </FilterSection>
              ) : null}

              {hasScales ? (
                <FilterSection title={t("scale")}>
                  {facets?.scales?.map((item) => (
                    <FilterChip
                      key={`scale-${item.id}`}
                      label={item.code ?? item.name ?? String(item.id)}
                      count={item.count}
                      selected={scaleIds.includes(item.id)}
                      onPress={() => onToggleScale(item.id)}
                    />
                  ))}
                </FilterSection>
              ) : null}
            </ScrollView>
          )}
          <NeuButton title={t("filterAll")} variant="ghost" onPress={onClearFilters} />
          <NeuButton title={t("cancel")} variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dismissArea: { flex: 1 },
  sheet: {
    maxHeight: "85%",
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  loadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.card,
    maxWidth: "100%",
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.bg,
  },
  chipLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
});
