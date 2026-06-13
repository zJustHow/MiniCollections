import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { resolveMediaUrl, updateUserObject, uploadImage } from "@minicollections/api";
import {
  displayPurchasePriceFromObject,
  normalizePurchaseDateInput,
  purchasePriceFromFormValue,
} from "@minicollections/core";
import NeuButton from "./neu/NeuButton";
import NeuInput from "./neu/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";

type UserObjectValues = {
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

type EditGroupObjectSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  groupId: string;
  userObject: UserObjectValues | null;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

export default function EditGroupObjectSheet({
  visible,
  onClose,
  onSaved,
  groupId,
  userObject,
}: EditGroupObjectSheetProps) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !userObject) return;
    setName(userObject.name ?? "");
    setPurchasePrice(displayPurchasePriceFromObject(userObject) ?? "");
    setPurchaseDate(userObject.purchase_date ?? userObject.purchaseDate ?? "");
    setNotes(userObject.other_notes ?? userObject.otherNotes ?? "");
    setExistingImageUrl(userObject.image_url ?? null);
    setPickedImage(null);
    setError(null);
  }, [visible, userObject]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t("uploadFailed"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPickedImage({
      uri: asset.uri,
      name: asset.fileName ?? "object-image.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
  };

  const handleSubmit = async () => {
    if (!userObject?.id) return;
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }

    const normalizedDate = normalizePurchaseDateInput(purchaseDate);
    if (purchaseDate.trim() && normalizedDate === undefined) {
      setError(t("purchaseDateInvalid"));
      return;
    }

    const brandObjectId = userObject.brand_object_id ?? userObject.brandObjectId;

    setSubmitting(true);
    setError(null);
    try {
      let imageUrl = existingImageUrl;
      if (pickedImage) {
        imageUrl = await uploadImage(pickedImage);
      }
      await updateUserObject(groupId, userObject.id, {
        brand_object_id:
          brandObjectId != null && brandObjectId !== "" ? Number(brandObjectId) : null,
        name: name.trim(),
        image_url: imageUrl ?? null,
        purchase_date: normalizedDate ?? null,
        ...purchasePriceFromFormValue(purchasePrice),
        other_notes: notes.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToUpdateModel"));
    } finally {
      setSubmitting(false);
    }
  };

  const previewUri =
    pickedImage?.uri ??
    (existingImageUrl ? resolveMediaUrl(existingImageUrl) : null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("editModel")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <NeuInput label={t("name")} value={name} onChangeText={setName} />
            <Text style={styles.coverLabel}>{t("image")}</Text>
            <View style={styles.coverWell}>
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.coverImage} contentFit="cover" />
              ) : (
                <Text style={styles.coverPlaceholder}>{t("image")}</Text>
              )}
            </View>
            <NeuButton title={t("image")} variant="ghost" onPress={() => void pickImage()} />
            <NeuInput
              label={t("purchasePrice")}
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
            />
            <NeuInput
              label={t("purchaseDate")}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
            <NeuInput
              label={t("otherNote")}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <NeuButton
              title={t("save")}
              loading={submitting}
              onPress={() => void handleSubmit()}
              style={styles.submit}
            />
            <NeuButton title={t("cancel")} variant="ghost" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dismissArea: { flex: 1 },
  sheet: {
    maxHeight: "85%",
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  coverLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  coverWell: {
    aspectRatio: 1,
    backgroundColor: colors.sl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    color: colors.textSecondary,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.md,
  },
});
