import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, neuRaised, spacing } from "@minicollections/theme";
import SkeletonLine from "./SkeletonLine";
import SkeletonShimmer from "./SkeletonShimmer";
import RelatedModelCardSkeleton from "./RelatedModelCardSkeleton";

type ObjectDetailPageSkeletonProps = {
  showRelatedModel?: boolean;
  showFollowOn?: boolean;
};

export default function ObjectDetailPageSkeleton({
  showRelatedModel = false,
  showFollowOn = false,
}: ObjectDetailPageSkeletonProps) {
  return (
    <View style={styles.root} accessibilityElementsHidden>
      <View style={styles.imagePanel}>
        <SkeletonShimmer style={styles.detailImage} />
      </View>

      <View style={styles.infoPanel}>
        <SkeletonLine style={styles.infoRow} />
        <SkeletonLine style={styles.infoRow} />
        <SkeletonLine style={styles.notesRow} />
      </View>

      {showFollowOn ? <SkeletonLine style={styles.followOnButton} /> : null}

      {showRelatedModel ? (
        <View style={styles.relatedBlock}>
          <SkeletonLine style={styles.relatedLabel} />
          <RelatedModelCardSkeleton />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  imagePanel: {
    padding: spacing.md,
    backgroundColor: colors.bg,
    ...neuRaised("sm"),
  },
  detailImage: {
    width: "100%",
    aspectRatio: 1.35,
  },
  infoPanel: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.bg,
    ...neuRaised("sm"),
  },
  infoRow: {
    width: "100%",
    height: 18,
  },
  notesRow: {
    width: "88%",
    height: 72,
    marginTop: spacing.sm,
  },
  followOnButton: {
    width: "100%",
    height: 44,
  },
  relatedBlock: {
    gap: spacing.sm,
  },
  relatedLabel: {
    width: "36%",
    height: 16,
  },
});
