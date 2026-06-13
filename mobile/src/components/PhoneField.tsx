import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COUNTRIES } from "@minicollections/core";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";

type PhoneFieldProps = {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
};

export default function PhoneField({
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
}: PhoneFieldProps) {
  const { t, locale } = useLocale();
  const [pickerVisible, setPickerVisible] = useState(false);

  const countryLabel = useMemo(() => {
    const match = COUNTRIES.find((c) => c.code === countryCode);
    if (!match) return countryCode;
    return locale === "zh-CN" ? match.zh : match.en;
  }, [countryCode, locale]);

  return (
    <View>
      <Text style={styles.label}>{t("phoneNumber")}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPickerVisible(true)}
          style={styles.codeBtn}
        >
          <Text style={styles.codeText}>{countryCode}</Text>
          <Text style={styles.codeHint} numberOfLines={1}>
            {countryLabel}
          </Text>
        </Pressable>
        <TextInput
          value={phoneNumber}
          onChangeText={onPhoneNumberChange}
          keyboardType="phone-pad"
          autoCapitalize="none"
          placeholderTextColor={colors.textSecondary}
          style={styles.numberInput}
        />
      </View>

      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.dismiss} onPress={() => setPickerVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t("phoneNumber")}</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.countryRow,
                    item.code === countryCode && styles.countryRowActive,
                  ]}
                  onPress={() => {
                    onCountryCodeChange(item.code);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.countryCode}>{item.code}</Text>
                  <Text style={styles.countryName}>
                    {locale === "zh-CN" ? item.zh : item.en}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  codeBtn: {
    width: 96,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.sl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  codeHint: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  numberInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dismiss: { flex: 1 },
  modalSheet: {
    maxHeight: "60%",
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  countryRowActive: {
    backgroundColor: colors.sl,
  },
  countryCode: {
    width: 48,
    fontWeight: "700",
    color: colors.accent,
  },
  countryName: {
    flex: 1,
    color: colors.text,
  },
});
