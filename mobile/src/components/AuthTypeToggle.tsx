import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { neuText } from "../theme/neuText";
import { PHONE_AUTH_ENABLED } from "../constants/authFeatures";
import { useLocale } from "../providers/LocaleProvider";
import {
  colors,
  neuControlStyle,
  neuInset,
  neuRaised,
  radius,
  spacing,
} from "@minicollections/theme";

export type AuthChannel = "email" | "phone";

type AuthTypeToggleProps = {
  value: AuthChannel;
  onChange: (value: AuthChannel) => void;
};

export default function AuthTypeToggle({ value, onChange }: AuthTypeToggleProps) {
  const { t } = useLocale();

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange("email")}
        style={({ pressed }) => [
          styles.btn,
          value === "email"
            ? neuControlStyle({ pressed })
            : pressed
              ? neuInset("default")
              : styles.btnIdle,
        ]}
      >
        <Text style={[styles.label, value === "email" && styles.labelActive]}>
          {t("registerWithEmail")}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!PHONE_AUTH_ENABLED}
        onPress={() => PHONE_AUTH_ENABLED && onChange("phone")}
        style={({ pressed }) => [
          styles.btn,
          value === "phone"
            ? neuControlStyle({ pressed })
            : pressed
              ? neuInset("default")
              : styles.btnIdle,
          !PHONE_AUTH_ENABLED && styles.btnDisabled,
        ]}
      >
        <Text
          style={[
            styles.label,
            value === "phone" && styles.labelActive,
            !PHONE_AUTH_ENABLED && styles.labelDisabled,
          ]}
        >
          {t("registerWithPhone")}
          {!PHONE_AUTH_ENABLED ? ` (${t("underDevelopment")})` : ""}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: 4,
    borderRadius: radius.card,
    backgroundColor: colors.bg,
    marginBottom: spacing.md,
    ...neuInset("default"),
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.card,
    backgroundColor: colors.bg,
  },
  btnIdle: {
    backgroundColor: colors.bg,
    ...neuRaised("xs"),
  },
  btnDisabled: {
    opacity: 0.65,
  },
  label: {
    ...neuText.formLabel,
    textAlign: "center",
  },
  labelActive: {
    color: colors.accent,
    fontWeight: neuText.body.fontWeight,
  },
  labelDisabled: {
    color: colors.textSecondary,
  },
});
