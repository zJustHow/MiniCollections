import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";

export type PickerOption = {
  id: string;
  label: string;
};

type OptionPickerFieldProps = {
  label: string;
  value: string | null;
  options: PickerOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (id: string | null, label: string | null) => void;
};

export default function OptionPickerField({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: OptionPickerFieldProps) {
  const { t } = useLocale();
  const [pickerVisible, setPickerVisible] = useState(false);

  const displayLabel = useMemo(() => {
    if (!value) return placeholder ?? label;
    return options.find((o) => o.id === value)?.label ?? value;
  }, [label, options, placeholder, value]);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => !disabled && setPickerVisible(true)}
          style={[styles.selector, disabled && styles.selectorDisabled]}
        >
          <Text style={[styles.selectorText, !value && styles.placeholder]} numberOfLines={1}>
            {displayLabel}
          </Text>
        </Pressable>
        {value ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onChange(null, null)}
            style={styles.clearBtn}
          >
            <Text style={styles.clear}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.dismiss} onPress={() => setPickerVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={styles.empty}>{t("noSearchResults")}</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.optionRow, value === item.id && styles.optionRowActive]}
                  onPress={() => {
                    onChange(item.id, item.label);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.optionLabel}>{item.label}</Text>
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
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  selector: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  selectorDisabled: {
    opacity: 0.55,
  },
  selectorText: {
    color: colors.text,
    fontSize: 16,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  clearBtn: {
    width: 40,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  clear: {
    fontSize: 22,
    color: colors.textSecondary,
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
  empty: {
    padding: spacing.lg,
    textAlign: "center",
    color: colors.textSecondary,
  },
  optionRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  optionRowActive: {
    backgroundColor: colors.sl,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 15,
  },
});
