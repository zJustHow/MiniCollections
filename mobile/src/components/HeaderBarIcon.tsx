import React from "react";
import { StyleSheet, View } from "react-native";
import { HEADER_BAR_ICON_SIZE } from "../theme/headerBarStyle";

type HeaderBarIconProps = {
  children: React.ReactNode;
};

/** Fixed icon box so glyphs align with header-bar text (web `line-height: 1`). */
export default function HeaderBarIcon({ children }: HeaderBarIconProps) {
  return <View style={styles.slot}>{children}</View>;
}

const styles = StyleSheet.create({
  slot: {
    width: HEADER_BAR_ICON_SIZE,
    height: HEADER_BAR_ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
