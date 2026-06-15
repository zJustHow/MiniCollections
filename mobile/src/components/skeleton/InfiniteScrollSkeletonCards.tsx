import React from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@minicollections/theme";
import NeuCardSkeleton from "./NeuCardSkeleton";
import type { SkeletonVariant } from "../../utils/skeletonUtils";

type InfiniteScrollSkeletonCardsProps = {
  variant?: SkeletonVariant | "brand";
  numColumns?: number;
};

export default function InfiniteScrollSkeletonCards({
  variant = "catalog",
  numColumns = 2,
}: InfiniteScrollSkeletonCardsProps) {
  const count = variant === "object" ? 6 : 4;

  return (
    <View
      style={[
        styles.grid,
        numColumns === 1 ? styles.gridSingleColumn : styles.gridTwoColumn,
      ]}
      accessibilityElementsHidden
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={numColumns === 1 ? styles.cellFull : styles.cellHalf}
        >
          <NeuCardSkeleton variant={variant} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.sm,
  },
  gridTwoColumn: {},
  gridSingleColumn: {
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  cellHalf: {
    width: "50%",
  },
  cellFull: {
    width: "100%",
  },
});
