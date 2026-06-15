import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, neuCardStyle, nameplateSubtitleSlotHeight, radius, spacing } from "@minicollections/theme";
import GroovedImage from "./GroovedImage";
import { resolveMediaUrl } from "@minicollections/api";
import { neuText } from "../theme/neuText";

type CatalogCardItem = {
  id?: number | string;
  name?: string;
  image_url?: string | null;
};

type NeuCardProps = {
  item?: CatalogCardItem;
  name?: string;
  subtitle?: string;
  variant?: "catalog" | "object" | "brand";
  add?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function NeuCard({
  item,
  name,
  subtitle,
  variant = "catalog",
  add = false,
  onPress,
  onLongPress,
}: NeuCardProps) {
  const displayName = name ?? item?.name ?? "";
  const imageUri = add ? undefined : resolveMediaUrl(item?.image_url ?? undefined);
  const isObject = variant === "object";
  const imageVariant = variant === "brand" ? "brand" : "card";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, neuCardStyle({ pressed })]}
    >
      <GroovedImage
        uri={imageUri}
        variant={imageVariant}
        add={add}
        style={styles.imageWell}
      />
      <Text style={styles.subtitleSlot} numberOfLines={1}>
        {subtitle ?? ""}
      </Text>
      <Text
        style={[
          styles.name,
          { minHeight: neuText.nameplateTitle.lineHeight * (isObject ? 2 : 1) },
        ]}
        numberOfLines={isObject ? 2 : 1}
      >
        {displayName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing.sm,
    margin: spacing.sm,
  },
  imageWell: {
    marginBottom: spacing.sm,
  },
  subtitleSlot: {
    ...neuText.nameplateSubtitle,
    minHeight: nameplateSubtitleSlotHeight,
    marginBottom: 0,
  },
  name: {
    ...neuText.nameplateTitle,
  },
});
