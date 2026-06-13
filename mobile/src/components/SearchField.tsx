import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@minicollections/theme";

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  placeholder: string;
};

export default function SearchField({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
}: SearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && onClear ? (
        <Pressable accessibilityRole="button" onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearLabel}>×</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" onPress={onSubmit} style={styles.submitBtn}>
        <Ionicons name="search" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  clearBtn: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  clearLabel: {
    fontSize: 24,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  submitBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
});
