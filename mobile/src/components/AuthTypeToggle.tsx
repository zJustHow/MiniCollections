import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PHONE_AUTH_ENABLED } from "../constants/authFeatures";
import { useLocale } from "../providers/LocaleProvider";
import { colors, radius, spacing } from "@minicollections/theme";

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
        style={[styles.btn, value === "email" && styles.btnActive]}
      >
        <Text style={[styles.label, value === "email" && styles.labelActive]}>
          {t("registerWithEmail")}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!PHONE_AUTH_ENABLED}
        onPress={() => PHONE_AUTH_ENABLED && onChange("phone")}
        style={[
          styles.btn,
          value === "phone" && styles.btnActive,
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
    backgroundColor: colors.sl,
    marginBottom: spacing.md,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.card - 2,
  },
  btnActive: {
    backgroundColor: colors.bg,
    shadowColor: colors.sd,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  labelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  labelDisabled: {
    color: colors.textSecondary,
  },
});
