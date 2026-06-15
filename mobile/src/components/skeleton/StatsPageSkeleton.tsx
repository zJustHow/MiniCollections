import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, neuRaised, spacing } from "@minicollections/theme";
import SkeletonLine from "./SkeletonLine";
import SkeletonShimmer from "./SkeletonShimmer";

function StatsPanelSkeleton({
  variant = "column",
}: {
  variant?: "pie" | "column" | "line";
}) {
  return (
    <View style={styles.panel} accessibilityElementsHidden>
      <SkeletonLine style={styles.panelTitle} />
      <View style={styles.chartWrap}>
        {variant === "pie" ? <SkeletonShimmer style={styles.pie} /> : null}
        {variant === "column" ? (
          <View style={styles.columns}>
            {[52, 78, 44, 92, 64, 70, 48, 86].map((height, index) => (
              <SkeletonShimmer
                key={index}
                style={[styles.columnBar, { height: Math.round((height / 100) * 160) }]}
              />
            ))}
          </View>
        ) : null}
        {variant === "line" ? <SkeletonShimmer style={styles.lineChart} /> : null}
      </View>
    </View>
  );
}

export default function StatsPageSkeleton() {
  return (
    <View style={styles.root} accessibilityElementsHidden>
      <SkeletonLine style={styles.pageTitle} />
      <SkeletonLine style={styles.pageSummary} />
      <StatsPanelSkeleton variant="pie" />
      <StatsPanelSkeleton variant="column" />
      <StatsPanelSkeleton variant="line" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  pageTitle: {
    width: "48%",
    height: 24,
    marginHorizontal: spacing.md,
  },
  pageSummary: {
    width: "62%",
    height: 18,
    marginHorizontal: spacing.md,
  },
  panel: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.bg,
    ...neuRaised("sm"),
  },
  panelTitle: {
    width: "44%",
    height: 18,
  },
  chartWrap: {
    minHeight: 180,
    justifyContent: "center",
  },
  pie: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
  },
  columns: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.xs,
    height: 160,
    paddingTop: spacing.sm,
  },
  columnBar: {
    flex: 1,
    minHeight: 24,
  },
  lineChart: {
    width: "100%",
    height: 160,
  },
});
