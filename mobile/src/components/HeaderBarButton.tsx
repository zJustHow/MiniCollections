import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors, neuFontSize } from "@minicollections/theme";
import { neuText } from "../theme/neuText";
import {
  HEADER_BAR_ACTION_MIN_WIDTH,
  HEADER_BAR_BUTTON_PADDING_X,
  neuHeaderBarStyle,
} from "../theme/headerBarStyle";

type HeaderBarButtonProps = Omit<PressableProps, "style"> & {
  title?: string;
  active?: boolean;
  danger?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export default function HeaderBarButton({
  title,
  active = false,
  danger = false,
  loading = false,
  disabled,
  style,
  children,
  ...rest
}: HeaderBarButtonProps) {
  const labelColor = active ? "#fff" : danger ? colors.dangerLight : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        neuHeaderBarStyle({ active, pressed: pressed && !active }),
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : children ? (
        children
      ) : (
        <Text
          style={[styles.label, { color: labelColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "stretch",
    minWidth: HEADER_BAR_ACTION_MIN_WIDTH,
    paddingHorizontal: HEADER_BAR_BUTTON_PADDING_X,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...neuText.headerBarLabel,
    fontSize: neuFontSize.fs16,
    lineHeight: neuFontSize.fs16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
