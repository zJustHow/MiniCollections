import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import NeuFormDrawer from "./NeuFormDrawer";
import { FilterGroup, FilterOption } from "./NeuRadio";
import { FilterPanelSkeleton } from "./skeleton";
import { useLocale } from "../providers/LocaleProvider";
import { colors, neuFontSize, spacing } from "@minicollections/theme";

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

type ObjectSearchFilterPanelProps = {
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
  showBrands?: boolean;
};

function formatFacetCount(count?: number) {
  const n = Number(count);
  if (!Number.isFinite(n)) return "";
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
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
      <FilterGroup>{children}</FilterGroup>
    </View>
  );
}

function FilterContent({
  facets,
  categoryIds,
  brandIds,
  scaleIds,
  seriesIds,
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
  onToggleSeries,
  showBrands,
}: {
  facets: SearchFacets;
  categoryIds: number[];
  brandIds: number[];
  scaleIds: number[];
  seriesIds: number[];
  onToggleCategory: (id: number) => void;
  onToggleBrand: (id: number) => void;
  onToggleScale: (id: number) => void;
  onToggleSeries: (id: number) => void;
  showBrands: boolean;
}) {
  const { t } = useLocale();

  const hasCategories = (facets.categories?.length ?? 0) > 0;
  const hasBrands = showBrands && (facets.brands?.length ?? 0) > 0;
  const hasScales = (facets.scales?.length ?? 0) > 0;
  const hasSeries = (facets.series?.length ?? 0) > 0;

  return (
    <>
      {hasCategories ? (
        <FilterSection title={t("category")}>
          {facets.categories?.map((item) => (
            <FilterOption
              key={`cat-${item.id}`}
              label={item.name ?? String(item.id)}
              count={formatFacetCount(item.count)}
              selected={categoryIds.includes(item.id)}
              onPress={() => onToggleCategory(item.id)}
            />
          ))}
        </FilterSection>
      ) : null}

      {hasBrands ? (
        <FilterSection title={t("brands")}>
          {facets.brands?.map((item) => (
            <FilterOption
              key={`brand-${item.id}`}
              label={item.name ?? String(item.id)}
              count={formatFacetCount(item.count)}
              selected={brandIds.includes(item.id)}
              onPress={() => onToggleBrand(item.id)}
            />
          ))}
        </FilterSection>
      ) : null}

      {hasSeries ? (
        <FilterSection title={t("series")}>
          {facets.series?.map((item) => (
            <FilterOption
              key={`series-${item.id}`}
              label={item.name ?? String(item.id)}
              count={formatFacetCount(item.count)}
              selected={seriesIds.includes(item.id)}
              onPress={() => onToggleSeries(item.id)}
            />
          ))}
        </FilterSection>
      ) : null}

      {hasScales ? (
        <FilterSection title={t("scale")}>
          {facets.scales?.map((item) => (
            <FilterOption
              key={`scale-${item.id}`}
              label={item.code ?? item.name ?? String(item.id)}
              count={formatFacetCount(item.count)}
              selected={scaleIds.includes(item.id)}
              onPress={() => onToggleScale(item.id)}
            />
          ))}
        </FilterSection>
      ) : null}
    </>
  );
}

export default function ObjectSearchFilterPanel({
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
  showBrands = true,
}: ObjectSearchFilterPanelProps) {
  const { t } = useLocale();

  const hasFacets =
    facets &&
    ((facets.categories?.length ?? 0) > 0 ||
      (showBrands && (facets.brands?.length ?? 0) > 0) ||
      (facets.scales?.length ?? 0) > 0 ||
      (facets.series?.length ?? 0) > 0);

  if (!visible) return null;
  if (!hasFacets && !loading) return null;

  return (
    <NeuFormDrawer visible={visible} title={t("searchFilters")} onClose={onClose}>
      {loading && !hasFacets ? (
        <FilterPanelSkeleton />
      ) : facets && hasFacets ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <FilterContent
            facets={facets}
            categoryIds={categoryIds}
            brandIds={brandIds}
            scaleIds={scaleIds}
            seriesIds={seriesIds}
            onToggleCategory={onToggleCategory}
            onToggleBrand={onToggleBrand}
            onToggleScale={onToggleScale}
            onToggleSeries={onToggleSeries}
            showBrands={showBrands}
          />
        </ScrollView>
      ) : null}
    </NeuFormDrawer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: neuFontSize.fs11,
    fontWeight: "400",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: neuFontSize.fs11 * 0.06,
    marginBottom: spacing.sm,
  },
});
