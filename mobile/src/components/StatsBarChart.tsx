import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@minicollections/theme";

type StatsBarChartProps = {
  title: string;
  items: Array<{ label: string; value: number }>;
  emptyLabel: string;
};

export default function StatsBarChart({ title, items, emptyLabel }: StatsBarChartProps) {
  const max = items.reduce((acc, item) => Math.max(acc, item.value), 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        items.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: max > 0 ? `${(item.value / max) * 100}%` : "0%" },
                ]}
              />
            </View>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    width: 88,
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  value: {
    width: 28,
    textAlign: "right",
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
});
