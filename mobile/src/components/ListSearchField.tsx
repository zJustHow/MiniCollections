import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  neuControlStyle,
  neuFieldStyle,
  spacing,
} from "@minicollections/theme";
import { neuText } from "../theme/neuText";
import {
  LIST_SEARCH_CONTROL_GAP,
  LIST_SEARCH_CONTROL_HEIGHT,
} from "../theme/listSearchStyle";

type ListSearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  placeholder: string;
  /** When true, horizontal padding is omitted (parent row supplies inset). */
  embedded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ListSearchField({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
  embedded = false,
  style,
}: ListSearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.wrap,
        embedded ? styles.wrapEmbedded : styles.wrapStandalone,
        style,
      ]}
    >
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
        accessibilityLabel="search"
        onPress={onSubmit}
        style={({ pressed }) => [styles.submitBtn, neuControlStyle({ pressed })]}
      >
        <Ionicons name="search" size={14} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: LIST_SEARCH_CONTROL_GAP,
  },
  wrapStandalone: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  wrapEmbedded: {
    flex: 1,
    minWidth: 0,
    paddingBottom: spacing.sm,
  },
  input: {
    ...neuText.formInput,
    flex: 1,
    minWidth: 0,
    height: LIST_SEARCH_CONTROL_HEIGHT,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  clearBtn: {
    width: LIST_SEARCH_CONTROL_HEIGHT,
    height: LIST_SEARCH_CONTROL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  clearLabel: {
    ...neuText.screenHeaderBack,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  submitBtn: {
    width: LIST_SEARCH_CONTROL_HEIGHT,
    height: LIST_SEARCH_CONTROL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});
