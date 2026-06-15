import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@minicollections/theme";

/** Matches web `.neu-search-section-divider`. */
export default function SearchSectionDivider() {
  return <View style={styles.divider} accessibilityRole="none" />;
}

const styles = StyleSheet.create({
  divider: {
    width: "100%",
    marginVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
