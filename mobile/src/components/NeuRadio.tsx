import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  colors,
  neuBoxShadow,
  neuFontSize,
  neuMotion,
} from "@minicollections/theme";

const RADIO_SIZE = 16;
const RADIO_DOT_SIZE = 8;

/** Matches web `.neu-filter-options-inset` max height. */
export const FILTER_OPTIONS_MAX_HEIGHT = 148;

type NeuRadioProps = {
  checked?: boolean;
  pressed?: boolean;
};

export function NeuRadio({ checked = false, pressed = false }: NeuRadioProps) {
  return (
    <View
      style={[
        styles.radio,
        checked ? styles.radioChecked : styles.radioUnchecked,
        pressed && !checked ? styles.radioPressed : null,
        pressed && checked ? styles.radioCheckedPressed : null,
      ]}
    >
      {checked ? <View style={styles.radioDot} /> : null}
    </View>
  );
}

type FilterGroupProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FilterGroup({ children, style }: FilterGroupProps) {
  return (
    <ScrollView
      style={[styles.track, style]}
      contentContainerStyle={styles.trackContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator
    >
      {children}
    </ScrollView>
  );
}

type FilterOptionProps = {
  label: string;
  count?: string;
  selected?: boolean;
  onPress: () => void;
};

export function FilterOption({
  label,
  count,
  selected = false,
  onPress,
}: FilterOptionProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected ? styles.optionSelected : null,
        !selected && pressed ? styles.optionPressed : null,
        selected && pressed ? styles.optionSelectedPressed : null,
      ]}
    >
      {({ pressed }) => (
        <>
          <NeuRadio checked={selected} pressed={pressed} />
          <View style={styles.optionBody}>
            <Text style={styles.optionLabel} numberOfLines={1}>
              {label}
            </Text>
            {count ? (
              <Text style={[styles.optionCount, selected && styles.optionCountSelected]}>
                {count}
              </Text>
            ) : null}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.bg,
  },
  radioUnchecked: {
    backgroundColor: colors.bg,
    boxShadow: neuBoxShadow.raisedSm,
  },
  radioPressed: {
    boxShadow: neuBoxShadow.insetSm,
    transform: [{ scale: neuMotion.btnScaleHover }],
  },
  radioChecked: {
    backgroundColor: colors.accent,
    boxShadow: neuBoxShadow.insetAccent,
  },
  radioCheckedPressed: {
    boxShadow: neuBoxShadow.insetAccent,
    transform: [{ scale: neuMotion.btnScaleHover }],
  },
  radioDot: {
    width: RADIO_DOT_SIZE,
    height: RADIO_DOT_SIZE,
    borderRadius: RADIO_DOT_SIZE / 2,
    backgroundColor: "#fff",
  },
  track: {
    maxHeight: FILTER_OPTIONS_MAX_HEIGHT,
    backgroundColor: colors.bg,
    boxShadow: neuBoxShadow.inset,
    borderWidth: 1,
    borderColor: colors.bg,
  },
  trackContent: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: 8,
    marginBottom: 5,
  },
  optionSelected: {
    backgroundColor: colors.bg,
    boxShadow: neuBoxShadow.inset,
  },
  optionPressed: {
    backgroundColor: colors.bg,
    boxShadow: neuBoxShadow.insetSm,
  },
  optionSelectedPressed: {
    backgroundColor: colors.bg,
    boxShadow: neuBoxShadow.inset,
  },
  optionBody: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  optionLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: neuFontSize.fs13,
    fontWeight: "400",
    color: colors.text,
  },
  optionCount: {
    flexShrink: 0,
    fontSize: neuFontSize.fs12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  optionCountSelected: {
    color: colors.accent,
  },
});
