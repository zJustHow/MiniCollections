import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, neuCardStyle, spacing } from "@minicollections/theme";
import SkeletonLine from "./SkeletonLine";
import SkeletonShimmer from "./SkeletonShimmer";

export default function RelatedModelCardSkeleton() {
  return (
    <View style={[styles.card, neuCardStyle({})]} accessibilityElementsHidden>
      <SkeletonShimmer style={styles.imageWell} />
      <SkeletonLine style={styles.subtitleLine} />
      <SkeletonLine style={styles.titleLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm,
    backgroundColor: colors.bg,
  },
  imageWell: {
    width: "100%",
    aspectRatio: 1.35,
    marginBottom: spacing.sm,
  },
  subtitleLine: {
    width: "42%",
    height: 14,
  },
  titleLine: {
    width: "72%",
    height: 32,
    marginTop: spacing.xs,
  },
});
