import React from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import GroovedImage from "./GroovedImage";
import { colors, neuRaised, spacing } from "@minicollections/theme";

type DetailImageProps = {
  imageUrl?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
};

/** Detail page image panel — mirrors web `DetailImage.js`. */
export default function DetailImage({ imageUrl, onPress, style }: DetailImageProps) {
  const body = (
    <View style={[styles.panel, style]}>
      <GroovedImage uri={imageUrl} variant="detail" placeholderSize={56} />
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={!imageUrl}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: spacing.md,
    backgroundColor: colors.bg,
    ...neuRaised("sm"),
  },
});
