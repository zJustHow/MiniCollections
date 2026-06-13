import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing } from "@minicollections/theme";
import { resolveMediaUrl } from "@minicollections/api";

type CatalogCardItem = {
  id?: number | string;
  name?: string;
  image_url?: string | null;
};

type NeuCardProps = {
  item: CatalogCardItem;
  subtitle?: string;
  variant?: "catalog" | "object";
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function NeuCard({
  item,
  subtitle,
  variant = "catalog",
  onPress,
  onLongPress,
}: NeuCardProps) {
  const imageUri = resolveMediaUrl(item.image_url ?? undefined);
  const isObject = variant === "object";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWell}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      {isObject && subtitle ? (
        <Text style={styles.objectSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
      <Text
        style={[styles.name, isObject && styles.objectName]}
        numberOfLines={isObject ? 2 : 2}
      >
        {item.name ?? ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    padding: spacing.sm,
    margin: spacing.xs,
    shadowColor: colors.sd,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWell: {
    aspectRatio: 1,
    backgroundColor: colors.sl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  image: {
    width: "88%",
    height: "88%",
  },
  placeholder: {
    width: "50%",
    height: "50%",
    backgroundColor: colors.border,
  },
  objectSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    minHeight: 36,
  },
  objectName: {
    fontSize: 13,
    minHeight: 32,
  },
});
