import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, neuInset, spacing } from "@minicollections/theme";

const BAR_WIDTH = 6;
const BAR_HEIGHT = 24;

export default function SiteLogoIcon() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, styles.barInset]} />
      <View style={[styles.bar, styles.barInset]} />
      <View style={[styles.bar, styles.barAccent]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 28,
  },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: 0,
  },
  barInset: {
    backgroundColor: colors.bg,
    ...neuInset(),
  },
  barAccent: {
    backgroundColor: colors.accentLight,
    ...neuInset("accent"),
  },
});
