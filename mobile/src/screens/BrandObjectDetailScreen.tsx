import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { adminDeleteBrandObject, getBrandObjectById, recordModelView, resolveMediaUrl } from "@minicollections/api";
import { formatReleasePrice, formatViewCount } from "@minicollections/core";
import { Ionicons } from "@expo/vector-icons";
import BrandObjectModal from "../components/BrandObjectModal";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import HeaderActionButton from "../components/HeaderActionButton";
import ObjectDetailBackHeader from "../components/pageHeaders/ObjectDetailBackHeader";
import NeuButton from "../components/NeuButton";
import { HEADER_BAR_ICON_SIZE } from "../theme/headerBarStyle";
import { useHeaderSlot } from "../hooks/useHeaderSlot";
import DetailImage from "../components/DetailImage";
import AddToGroupModal from "../components/AddToGroupModal";
import ImageViewerModal from "../components/ImageViewerModal";
import { ObjectDetailPageSkeleton } from "../components/skeleton";
import { useLocale } from "../providers/LocaleProvider";
import { useAuth } from "../providers/AuthProvider";
import type { BrandsStackParamList } from "../navigation/types";
import { pickDetailField, pickDetailText } from "../utils/detailFields";
import { trackModelViewOnce } from "../utils/viewTracking";
import { catalogObjectDeepLink } from "../utils/deepLinks";
import { shareModelLink } from "../utils/shareModel";
import { openLogin } from "../navigation/openLogin";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type Props = NativeStackScreenProps<BrandsStackParamList, "BrandObjectDetail">;

type BrandObjectDetail = {
  id?: number | string;
  name?: string;
  image_url?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  brand?: string | { name?: string | null };
  category?: string | { name?: string | null };
  scale?: string | { name?: string | null };
  series?: string | { name?: string | null };
  release_price?: string | number | null;
  release_price_cny?: number | string | null;
  release_price_usd?: number | string | null;
  releasePriceCny?: number | string | null;
  releasePriceUsd?: number | string | null;
  release_date?: string | null;
  releaseDate?: string | null;
  image_source?: string | null;
  imageSource?: string | null;
  view_count?: number;
  viewCount?: number;
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
  const { brandId, brandName, objectId, objectName } = route.params;
  const { t, locale } = useLocale();
  const { authed, isAdmin } = useAuth();
  const [detail, setDetail] = useState<BrandObjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

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

  useEffect(() => {
    trackModelViewOnce(objectId, isAdmin, recordModelView);
  }, [objectId, isAdmin]);

  const title = detail?.name ?? objectName ?? "…";
  const imageUri = resolveMediaUrl(detail?.image_url ?? undefined);
  const description = pickDescription(detail, locale);
  const viewCountLabel = formatViewCount(
    detail?.view_count ?? detail?.viewCount,
    t,
  );
  const brandLabel =
    pickDetailField(detail?.brand) ?? pickDetailText(brandName) ?? null;
  const seriesLabel = pickDetailField(detail?.series);
  const categoryLabel = pickDetailField(detail?.category);
  const scaleLabel = pickDetailField(detail?.scale);
  const releasePriceLabel = detail ? formatReleasePrice(detail) : null;
  const releaseDateLabel = pickDetailText(
    detail?.release_date ?? detail?.releaseDate,
  );
  const imageSourceLabel = pickDetailText(
    detail?.image_source ?? detail?.imageSource,
  );

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

  const openDataCorrection = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "FeedbackTab",
        params: {
          screen: "FeedbackHome",
          params: {
            openSubmit: true,
            brandId,
            brandName: brandName ?? undefined,
            submissionType: "DATA_CORRECTION",
            initialNameEn: title !== "…" ? title : undefined,
          },
        },
      }),
    );
  };

  const shareObject = useCallback(async () => {
    try {
      await shareModelLink(title, catalogObjectDeepLink(brandId, objectId));
    } catch {
      // user dismissed
    }
  }, [brandId, objectId, title]);

  const handleAdminDelete = useCallback(async () => {
    if (detail?.id == null) return;
    try {
      await adminDeleteBrandObject(detail.id);
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        err instanceof Error ? err.message : t("failedToDeleteBrandObject"),
      );
    }
  }, [detail?.id, navigation, t]);

  useHeaderSlot(
    <ObjectDetailBackHeader
      title={title}
      onBack={() => navigation.goBack()}
      rightActions={
        isAdmin && detail ? (
          <>
            <HeaderActionButton
              accessibilityLabel={t("editModel")}
              onPress={() => setEditModalVisible(true)}
              icon={
                <Ionicons
                  name="create-outline"
                  size={HEADER_BAR_ICON_SIZE}
                  color={colors.accent}
                />
              }
            />
            <ConfirmDeleteButton variant="header" onConfirm={handleAdminDelete} />
          </>
        ) : null
      }
    />,
    [detail, handleAdminDelete, isAdmin, navigation, t, title],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      {loading ? (
        <ObjectDetailPageSkeleton showFollowOn />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <NeuButton title={t("retry")} onPress={() => void load()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <DetailImage
            imageUrl={imageUri}
            onPress={() => imageUri && setImageViewerVisible(true)}
          />

          {brandLabel ? (
            <DetailRow label={t("brand")} value={brandLabel} />
          ) : null}
          {seriesLabel ? (
            <DetailRow label={t("series")} value={seriesLabel} />
          ) : null}
          {categoryLabel ? (
            <DetailRow label={t("category")} value={categoryLabel} />
          ) : null}
          {scaleLabel ? (
            <DetailRow label={t("scale")} value={scaleLabel} />
          ) : null}
          {releasePriceLabel ? (
            <DetailRow label={t("releasePrice")} value={releasePriceLabel} />
          ) : null}
          {releaseDateLabel ? (
            <DetailRow label={t("releaseDate")} value={releaseDateLabel} />
          ) : null}
          {imageSourceLabel ? (
            <DetailRow label={t("imageSource")} value={imageSourceLabel} />
          ) : null}
          {viewCountLabel ? (
            <DetailRow label={t("viewCount")} value={viewCountLabel} />
          ) : null}
          {description ? (
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionLabel}>{t("description")}</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          ) : null}

          <NeuButton
            title={t("share")}
            variant="ghost"
            onPress={() => void shareObject()}
            style={styles.action}
          />

          {authed ? (
            <>
              <NeuButton
                title={t("addToGroup")}
                onPress={() => setAddSheetVisible(true)}
                style={styles.action}
              />
              <NeuButton
                title={t("feedbackTypeDataCorrection")}
                variant="ghost"
                onPress={openDataCorrection}
                style={styles.action}
              />
            </>
          ) : (
            <NeuButton
              title={t("signIn")}
              onPress={() => openLogin(navigation)}
              style={styles.action}
            />
          )}
        </ScrollView>
      )}

      {detail?.id != null ? (
        <AddToGroupModal
          visible={addSheetVisible}
          onClose={() => setAddSheetVisible(false)}
          onSuccess={handleAddSuccess}
          brandObjectId={detail.id}
          defaultName={detail.name ?? objectName ?? ""}
          defaultImageUrl={detail.image_url}
        />
      ) : null}
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUri={imageUri}
        onClose={() => setImageViewerVisible(false)}
      />

      {isAdmin && detail ? (
        <BrandObjectModal
          visible={editModalVisible}
          brandId={brandId}
          object={detail as Record<string, unknown> & { id: number | string }}
          onClose={() => setEditModalVisible(false)}
          onSuccess={() => void load()}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...neuText.panelLabel,
  },
  rowValue: {
    ...neuText.panelValue,
    flex: 1,
    textAlign: "right",
  },
  descriptionBlock: {
    gap: spacing.xs,
  },
  descriptionLabel: {
    ...neuText.panelLabel,
  },
  descriptionText: {
    ...neuText.panelBody,
  },
  action: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
});
