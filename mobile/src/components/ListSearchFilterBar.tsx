import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@minicollections/theme";
import SearchFilterButton from "./SearchFilterButton";
import { LIST_SEARCH_FILTER_BAR_GAP } from "../theme/listSearchStyle";

type ListSearchFilterBarProps = {
  summary?: string | null;
  summaryLoading?: boolean;
  filterLabel: string;
  activeFilterCount?: number;
  onOpenFilters: () => void;
};

export default function ListSearchFilterBar({
  summary,
  summaryLoading = false,
  filterLabel,
  activeFilterCount = 0,
  onOpenFilters,
}: ListSearchFilterBarProps) {
  return (
    <View style={styles.row}>
      {!summaryLoading && summary ? (
        <Text style={styles.summary} numberOfLines={2}>
          {summary}
        </Text>
      ) : (
        <View style={styles.summarySpacer} />
      )}
      <SearchFilterButton
        label={filterLabel}
        activeCount={activeFilterCount}
        onPress={onOpenFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: LIST_SEARCH_FILTER_BAR_GAP,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm + spacing.xs,
  },
  summary: {
    flex: 1,
    minWidth: 0,
    color: colors.textSecondary,
    fontSize: 13,
  },
  summarySpacer: {
    flex: 1,
    minWidth: 0,
  },
});
