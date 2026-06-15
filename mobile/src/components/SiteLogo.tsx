import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, neuFontSize, neuLetterSpacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";
import SiteLogoIcon from "./SiteLogoIcon";

export default function SiteLogo() {
  return (
    <View style={styles.wrap}>
      <SiteLogoIcon />
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        Mini <Text style={styles.accent}>Collections</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    minWidth: 0,
  },
  label: {
    ...neuText.headerLogo,
    fontSize: neuFontSize.fs20,
    lineHeight: neuFontSize.fs22,
    letterSpacing: neuLetterSpacing.headerLogo,
    includeFontPadding: false,
    textTransform: "uppercase",
    color: colors.text,
    flexShrink: 1,
  },
  accent: {
    color: colors.accent,
  },
});
