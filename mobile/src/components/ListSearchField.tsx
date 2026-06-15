import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  neuControlStyle,
  neuFieldStyle,
  spacing,
} from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type ListSearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  placeholder: string;
};

export default function ListSearchField({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
}: ListSearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, neuFieldStyle({ focused })]}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value.length > 0 && onClear ? (
        <Pressable
          accessibilityRole="button"
          onPress={onClear}
          style={({ pressed }) => [styles.clearBtn, neuControlStyle({ pressed })]}
        >
          <Text style={styles.clearLabel}>×</Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.submitBtn,
          neuControlStyle({ variant: "primary", pressed }),
        ]}
      >
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
    ...neuText.formInput,
    flex: 1,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  clearBtn: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  clearLabel: {
    ...neuText.screenHeaderBack,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  submitBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
