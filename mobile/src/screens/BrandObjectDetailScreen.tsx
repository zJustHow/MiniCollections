import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { getBrandObjectById, resolveMediaUrl } from "@minicollections/api";
import ScreenHeader from "../components/ScreenHeader";
import NeuButton from "../components/neu/NeuButton";
import AddToGroupSheet from "../components/AddToGroupSheet";
import { useLocale } from "../providers/LocaleProvider";
import { useAuth } from "../providers/AuthProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<BrandsStackParamList, "BrandObjectDetail">;

type BrandObjectDetail = {
  id?: number | string;
  name?: string;
  image_url?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  scale?: { name?: string };
  series?: { name?: string };
  release_price?: string | number | null;
  view_count?: number;
};

function pickDescription(obj: BrandObjectDetail | null, locale: string) {
  if (!obj) return null;
  const candidates = locale.startsWith("zh")
    ? [obj.description_zh, obj.description, obj.description_en]
    : [obj.description_en, obj.description, obj.description_zh];
  return (
    candidates
      .map((value) => (typeof value === "string" ? value.trim() : value))
      .find((value) => value != null && value !== "" && value !== "—") ?? null
  );
}

export default function BrandObjectDetailScreen({ route, navigation }: Props) {
  const { objectId, objectName } = route.params;
  const { t, locale } = useLocale();
  const { authed } = useAuth();
  const [detail, setDetail] = useState<BrandObjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBrandObjectById(objectId);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadModels"));
    } finally {
      setLoading(false);
    }
  }, [objectId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const title = detail?.name ?? objectName ?? "…";
  const imageUri = resolveMediaUrl(detail?.image_url ?? undefined);
  const description = pickDescription(detail, locale);

  const handleAddSuccess = (groupId: string, groupName: string) => {
    Alert.alert(t("addedToGroupSuccessfully"));
    navigation.dispatch(
      CommonActions.navigate({
        name: "GroupsTab",
        params: {
          screen: "GroupObjects",
          params: { groupId, groupName },
        },
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader title={title} showBack />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <NeuButton title={t("retry")} onPress={() => void load()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
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

          {detail?.scale?.name ? (
            <DetailRow label={t("scale")} value={detail.scale.name} />
          ) : null}
          {detail?.series?.name ? (
            <DetailRow label={t("series")} value={detail.series.name} />
          ) : null}
          {detail?.release_price != null && detail.release_price !== "" ? (
            <DetailRow
              label={t("releasePrice")}
              value={String(detail.release_price)}
            />
          ) : null}
          {description ? (
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionLabel}>{t("description")}</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          ) : null}

          {authed ? (
            <NeuButton
              title={t("addToGroup")}
              onPress={() => setAddSheetVisible(true)}
              style={styles.action}
            />
          ) : (
            <NeuButton
              title={t("signIn")}
              onPress={() =>
                navigation.getParent()?.getParent()?.navigate("Login")
              }
              style={styles.action}
            />
          )}
        </ScrollView>
      )}

      {detail?.id != null ? (
        <AddToGroupSheet
          visible={addSheetVisible}
          onClose={() => setAddSheetVisible(false)}
          onSuccess={handleAddSuccess}
          brandObjectId={detail.id}
          defaultName={detail.name ?? objectName ?? ""}
          defaultImageUrl={detail.image_url}
        />
      ) : null}
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  imageWell: {
    aspectRatio: 1,
    backgroundColor: colors.sl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "92%",
    height: "92%",
  },
  placeholder: {
    width: "40%",
    height: "40%",
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  rowValue: {
    flex: 1,
    textAlign: "right",
    color: colors.text,
    fontSize: 14,
  },
  descriptionBlock: {
    gap: spacing.xs,
  },
  descriptionLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  descriptionText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  action: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
});
