import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import {
  colors,
  neuControlStyle,
  radius,
  spacing,
  type NeuControlVariant,
} from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type NeuButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  /** @deprecated use `default` */
  variant?: NeuControlVariant | "ghost";
  style?: ViewStyle;
};

export default function NeuButton({
  title,
  loading = false,
  variant = "primary",
  disabled,
  style,
  ...rest
}: NeuButtonProps) {
  const resolvedVariant: NeuControlVariant =
    variant === "ghost" ? "default" : variant;
  const isPrimary = resolvedVariant === "primary";
  const isDanger = resolvedVariant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        neuControlStyle({
          variant: resolvedVariant,
          pressed,
          disabled: Boolean(disabled || loading),
        }),
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary || isDanger ? "#fff" : colors.accent}
        />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary || isDanger ? styles.lightLabel : styles.defaultLabel,
            disabled && styles.disabledLabel,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...neuText.button,
  },
  lightLabel: {
    color: "#fff",
  },
  defaultLabel: {
    color: colors.text,
  },
  disabledLabel: {
    color: colors.textSecondary,
  },
});
