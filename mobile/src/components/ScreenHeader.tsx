import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, neuControlStyle, neuRaisedUp, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightSlot,
}: ScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={onBack ?? (() => navigation.goBack())}
            style={({ pressed }) => [styles.backBtn, neuControlStyle({ pressed })]}
          >
            <Text style={styles.backLabel}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.rightSlot}>{rightSlot ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
    ...neuRaisedUp("sm"),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backLabel: {
    ...neuText.screenHeaderBack,
  },
  backPlaceholder: {
    width: 40,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...neuText.screenHeaderTitle,
  },
  subtitle: {
    ...neuText.screenHeaderSubtitle,
    marginTop: 2,
  },
  rightSlot: {
    minWidth: 40,
    alignItems: "flex-end",
  },
});
