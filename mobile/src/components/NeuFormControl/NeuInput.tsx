import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors, neuFieldStyle, spacing } from "@minicollections/theme";
import { neuText } from "../../theme/neuText";

type NeuInputProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export default function NeuInput({ label, error, style, ...rest }: NeuInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          neuFieldStyle({ focused, disabled: rest.editable === false }),
          error ? styles.inputError : null,
          style,
        ]}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    ...neuText.formLabel,
    marginBottom: spacing.xs,
  },
  input: {
    ...neuText.formInput,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderTopColor: colors.danger,
    borderLeftColor: colors.danger,
  },
  error: {
    ...neuText.formError,
    marginTop: spacing.xs,
  },
});
