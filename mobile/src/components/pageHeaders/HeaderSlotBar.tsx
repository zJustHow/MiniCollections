import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { neuFontSize, spacing } from "@minicollections/theme";
import { neuText } from "../../theme/neuText";
import { HEADER_HEIGHT } from "../../theme/headerBarStyle";

type HeaderSlotBarProps = {
  title: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
};

/** Mirrors web `.header-slot-bar` grid: 1fr | auto | 1fr for optical title centering. */
export default function HeaderSlotBar({
  title,
  leftActions,
  rightActions,
}: HeaderSlotBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.sideStart}>{leftActions ?? null}</View>
      <View style={styles.titleWrap} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <View style={styles.sideEnd}>{rightActions ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: HEADER_HEIGHT,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    overflow: "visible",
  },
  sideStart: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  sideEnd: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-end",
  },
  titleWrap: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: "50%",
    justifyContent: "center",
  },
  title: {
    ...neuText.headerSlotTitle,
    fontSize: neuFontSize.fs16,
    lineHeight: neuFontSize.fs20,
    includeFontPadding: false,
    textAlign: "center",
  },
});
