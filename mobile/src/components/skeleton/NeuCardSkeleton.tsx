import React from "react";
import { StyleSheet, View } from "react-native";
import {
  colors,
  nameplateSubtitleSlotHeight,
  neuCardStyle,
  spacing,
} from "@minicollections/theme";
import { neuText } from "../../theme/neuText";
import SkeletonLine from "./SkeletonLine";
import SkeletonShimmer from "./SkeletonShimmer";
import type { SkeletonVariant } from "../../utils/skeletonUtils";

type NeuCardSkeletonProps = {
  variant?: SkeletonVariant | "brand";
};

export default function NeuCardSkeleton({
  variant = "catalog",
}: NeuCardSkeletonProps) {
  const isObject = variant === "object";

  return (
    <View style={[styles.card, neuCardStyle({})]} accessibilityElementsHidden>
      <SkeletonShimmer style={styles.imageWell} />
      {isObject ? (
        <SkeletonLine style={styles.subtitleLine} />
      ) : (
        <View style={styles.subtitleSlot} />
      )}
      <SkeletonLine
        style={[
          styles.titleLine,
          {
            height: neuText.nameplateTitle.lineHeight * (isObject ? 2 : 1),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.sm,
    margin: spacing.sm,
    backgroundColor: colors.bg,
  },
  imageWell: {
    width: "100%",
    aspectRatio: 1.35,
    marginBottom: spacing.sm,
  },
  subtitleSlot: {
    minHeight: nameplateSubtitleSlotHeight,
    marginBottom: 0,
  },
  subtitleLine: {
    width: "42%",
    height: neuText.nameplateSubtitle.lineHeight,
    marginBottom: 0,
  },
  titleLine: {
    width: "72%",
    marginTop: spacing.xs,
  },
});
