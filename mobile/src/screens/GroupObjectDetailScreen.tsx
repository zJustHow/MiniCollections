import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import {
  deleteUserObject,
  getBrandObjectById,
  getUserObjectById,
  resolveMediaUrl,
} from "@minicollections/api";
import { displayPurchasePriceFromObject } from "@minicollections/core";
import ScreenHeader from "../components/ScreenHeader";
import NeuButton from "../components/neu/NeuButton";
import NeuCard from "../components/neu/NeuCard";
import EditGroupObjectSheet from "../components/EditGroupObjectSheet";
import ImageViewerModal from "../components/ImageViewerModal";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { GroupsStackParamList } from "../navigation/types";
import { openLogin } from "../navigation/openLogin";
import { groupObjectDeepLink } from "../utils/deepLinks";
import { shareModelLink } from "../utils/shareModel";
import { colors, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<GroupsStackParamList, "GroupObjectDetail">;

type UserObjectDetail = {
  id?: number | string;
  name?: string;
  image_url?: string | null;
  purchase_price?: number | string | null;
  purchasePrice?: number | string | null;
  purchase_date?: string | null;
  purchaseDate?: string | null;
  other_notes?: string | null;
  otherNotes?: string | null;
  brand_object_id?: number | string;
  brandObjectId?: number | string;
};

type BrandObjectSummary = {
  id?: number | string;
  name?: string;
  image_url?: string | null;
  brand_id?: number | string;
  brandId?: number | string;
  brand?: { name?: string; id?: number | string };
};

export default function GroupObjectDetailScreen({ route, navigation }: Props) {
  const { groupId, objectId, objectName } = route.params;
  const { authed } = useAuth();
  const { t } = useLocale();
  const [detail, setDetail] = useState<UserObjectDetail | null>(null);
  const [brandObject, setBrandObject] = useState<BrandObjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserObjectById(groupId, objectId);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadGroupModels"));
    } finally {
      setLoading(false);
    }
  }, [authed, groupId, objectId, t]);

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      return;
    }
    void load();
  }, [authed, load]);

  useEffect(() => {
    if (!authed) return;
    const brandObjectId = detail?.brand_object_id ?? detail?.brandObjectId;
    if (!brandObjectId) {
      setBrandObject(null);
      return;
    }
    setLoadingBrand(true);
    getBrandObjectById(brandObjectId)
      .then(setBrandObject)
      .catch(() => setBrandObject(null))
      .finally(() => setLoadingBrand(false));
  }, [authed, detail]);

  const title = detail?.name ?? objectName ?? "…";
  const imageUri = resolveMediaUrl(detail?.image_url ?? undefined);
  const purchasePrice = displayPurchasePriceFromObject(detail);
  const purchaseDate = detail?.purchase_date ?? detail?.purchaseDate ?? null;
  const notes = detail?.other_notes ?? detail?.otherNotes ?? null;

  const shareObject = useCallback(async () => {
    try {
      await shareModelLink(title, groupObjectDeepLink(groupId, objectId));
    } catch {
      // user dismissed
    }
  }, [groupId, objectId, title]);

  const openCatalogObject = () => {
    if (!brandObject) return;
    const brandId = String(
      brandObject.brand_id ??
        brandObject.brandId ??
        brandObject.brand?.id ??
        "",
    );
    if (!brandId || brandObject.id == null) return;

    navigation.dispatch(
      CommonActions.navigate({
        name: "BrandsTab",
        params: {
          screen: "BrandObjectDetail",
          params: {
            brandId,
            objectId: String(brandObject.id),
            objectName: brandObject.name ?? "",
          },
        },
      }),
    );
  };

  const confirmDelete = () => {
    Alert.alert(t("deleteModelTitle"), t("deleteModelContent"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => void handleDelete(),
      },
    ]);
  };

  const handleDelete = async () => {
    if (detail?.id == null) return;
    setDeleting(true);
    try {
      await deleteUserObject(groupId, detail.id);
      Alert.alert(t("modelDeleted"));
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        err instanceof Error ? err.message : t("failedToDeleteModel"),
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <ScreenHeader title={objectName ?? t("groups")} showBack />
        <View style={styles.centered}>
          <Text style={styles.guestText}>{t("signIn")}</Text>
          <NeuButton
            title={t("signIn")}
            onPress={() => openLogin(navigation)}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title={title}
        showBack
        rightSlot={
          detail ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setEditVisible(true)}
              style={styles.editBtn}
            >
              <Text style={styles.editLabel}>{t("editModel")}</Text>
            </Pressable>
          ) : null
        }
      />
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
          <Pressable
            accessibilityRole="button"
            disabled={!imageUri}
            onPress={() => imageUri && setImageViewerVisible(true)}
            style={styles.imageWell}
          >
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
          </Pressable>

          {purchasePrice != null ? (
            <DetailRow label={t("purchasePrice")} value={purchasePrice} />
          ) : null}
          {purchaseDate ? (
            <DetailRow label={t("purchaseDate")} value={purchaseDate} />
          ) : null}
          {notes ? (
            <View style={styles.notesBlock}>
              <Text style={styles.notesLabel}>{t("notes")}</Text>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          ) : null}

          {(loadingBrand || brandObject) && (
            <View style={styles.relatedBlock}>
              <Text style={styles.relatedLabel}>{t("brandModelLabel")}</Text>
              {loadingBrand ? (
                <ActivityIndicator color={colors.accent} />
              ) : brandObject ? (
                <Pressable onPress={openCatalogObject}>
                  <NeuCard
                    item={{
                      id: brandObject.id ?? "brand-object",
                      name: brandObject.name,
                      image_url: brandObject.image_url,
                    }}
                    variant="object"
                    subtitle={brandObject.brand?.name}
                  />
                </Pressable>
              ) : null}
            </View>
          )}

          <NeuButton
            title={t("share")}
            variant="ghost"
            onPress={() => void shareObject()}
            style={styles.shareBtn}
          />

          <NeuButton
            title={t("delete")}
            variant="ghost"
            loading={deleting}
            onPress={confirmDelete}
            style={styles.deleteBtn}
          />
        </ScrollView>
      )}

      <EditGroupObjectSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSaved={() => {
          Alert.alert(t("modelUpdated"));
          void load();
        }}
        groupId={groupId}
        userObject={detail}
      />
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUri={imageUri}
        onClose={() => setImageViewerVisible(false)}
      />
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
  notesBlock: {
    gap: spacing.xs,
  },
  notesLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  notesText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  relatedBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  relatedLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  deleteBtn: {
    marginTop: spacing.lg,
    borderColor: colors.danger,
  },
  shareBtn: {
    marginTop: spacing.md,
  },
  guestText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  editBtn: {
    paddingHorizontal: spacing.xs,
  },
  editLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
});
