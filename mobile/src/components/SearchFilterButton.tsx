import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, neuControlStyle, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";
import { LIST_SEARCH_CONTROL_HEIGHT } from "../theme/listSearchStyle";

type SearchFilterButtonProps = {
  label: string;
  activeCount?: number;
  onPress: () => void;
};

export default function SearchFilterButton({
  label,
  activeCount = 0,
  onPress,
}: SearchFilterButtonProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.btn, neuControlStyle({ pressed })]}
      >
        <Ionicons name="filter-outline" size={14} color={colors.text} />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {activeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{activeCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    flexShrink: 0,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: LIST_SEARCH_CONTROL_HEIGHT,
    paddingHorizontal: 15,
  },
  label: {
    ...neuText.button,
    color: colors.text,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeLabel: {
    ...neuText.badge,
    color: "#fff",
    fontSize: 10,
    lineHeight: 12,
  },
});
