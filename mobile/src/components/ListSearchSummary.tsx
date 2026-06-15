import React from "react";
import { StyleSheet, Text } from "react-native";
import { colors, spacing } from "@minicollections/theme";

type ListSearchSummaryProps = {
  summary: string;
};

export default function ListSearchSummary({ summary }: ListSearchSummaryProps) {
  return <Text style={styles.summary}>{summary}</Text>;
}

const styles = StyleSheet.create({
  summary: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + spacing.xs,
  },
});
