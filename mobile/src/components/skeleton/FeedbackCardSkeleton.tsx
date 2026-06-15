import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, neuRaised, spacing } from "@minicollections/theme";
import SkeletonLine from "./SkeletonLine";

export default function FeedbackCardSkeleton() {
  return (
    <View style={styles.card} accessibilityElementsHidden>
      <View style={styles.header}>
        <View style={styles.main}>
          <SkeletonLine style={styles.tag} />
          <SkeletonLine style={styles.title} />
          <SkeletonLine style={styles.brand} />
        </View>
        <View style={styles.meta}>
          <SkeletonLine style={styles.tag} />
          <SkeletonLine style={styles.date} />
        </View>
      </View>
      <SkeletonLine style={styles.notes} />
    </View>
  );
}

export function FeedbackListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.list} accessibilityElementsHidden>
      {Array.from({ length: count }, (_, index) => (
        <FeedbackCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  card: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 72,
    backgroundColor: colors.bg,
    ...neuRaised("sm"),
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  main: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  meta: {
    gap: spacing.xs,
    alignItems: "flex-end",
  },
  tag: {
    width: 72,
    height: 14,
  },
  title: {
    width: "78%",
    height: 18,
  },
  brand: {
    width: "52%",
    height: 14,
  },
  date: {
    width: 64,
    height: 14,
  },
  notes: {
    width: "92%",
    height: 32,
  },
});
