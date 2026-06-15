import React from "react";
import { StyleSheet, View } from "react-native";
import { neuBoxShadow, spacing } from "@minicollections/theme";
import SkeletonLine from "./SkeletonLine";
import SkeletonShimmer from "./SkeletonShimmer";

const SECTIONS = [
  { key: "a", options: 4 },
  { key: "b", options: 3 },
  { key: "c", options: 5 },
] as const;

export default function FilterPanelSkeleton() {
  return (
    <View style={styles.root} accessibilityElementsHidden>
      {SECTIONS.map((section) => (
        <View key={section.key} style={styles.section}>
          <SkeletonLine style={styles.sectionTitle} />
          <View style={styles.options}>
            {Array.from({ length: section.options }, (_, index) => (
              <SkeletonShimmer key={index} style={styles.option} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    width: "38%",
    height: 14,
  },
  options: {
    gap: 6,
    padding: spacing.sm,
    boxShadow: neuBoxShadow.insetSm,
  },
  option: {
    width: "100%",
    height: 32,
  },
});
