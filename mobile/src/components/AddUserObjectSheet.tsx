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
import { createUserObject, resolveMediaUrl, uploadImage } from "@minicollections/api";
import {
  normalizePurchaseDateInput,
  purchasePriceFromFormValue,
} from "@minicollections/core";
import NeuButton from "./neu/NeuButton";
import NeuInput from "./neu/NeuInput";
import ModelPickerField, { type CatalogModelOption } from "./ModelPickerField";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";

type AddUserObjectSheetProps = {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
  groupId: string;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

export default function AddUserObjectSheet({
  visible,
  onClose,
  onAdded,
  groupId,
}: AddUserObjectSheetProps) {
  const { t } = useLocale();
  const [selectedModel, setSelectedModel] = useState<CatalogModelOption | null>(null);
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [catalogImageUrl, setCatalogImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setSelectedModel(null);
    setName("");
    setPurchasePrice("");
    setPurchaseDate("");
    setNotes("");
    setPickedImage(null);
    setCatalogImageUrl(null);
    setError(null);
  }, [visible]);

  const handleSelectModel = (model: CatalogModelOption | null) => {
    setSelectedModel(model);
    if (model) {
      setName(model.name ?? "");
      setCatalogImageUrl(model.image_url ?? null);
      setPickedImage(null);
      return;
    }
    setCatalogImageUrl(null);
  };

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
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }

    const normalizedDate = normalizePurchaseDateInput(purchaseDate);
    if (purchaseDate.trim() && normalizedDate === undefined) {
      setError(t("purchaseDateInvalid"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let imageUrl = catalogImageUrl;
      if (pickedImage) {
        imageUrl = await uploadImage(pickedImage);
      }
      await createUserObject(groupId, {
        brand_object_id: selectedModel?.id ?? null,
        name: name.trim(),
        image_url: imageUrl ?? null,
        purchase_date: normalizedDate ?? null,
        ...purchasePriceFromFormValue(purchasePrice),
        other_notes: notes.trim() || null,
      });
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToAddModel"));
    } finally {
      setSubmitting(false);
    }
  };

  const previewUri =
    pickedImage?.uri ??
    (catalogImageUrl ? resolveMediaUrl(catalogImageUrl) : null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("addModel")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ModelPickerField
              selectedModel={selectedModel}
              onSelectModel={handleSelectModel}
            />
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
              placeholder="0.00"
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
              title={t("addModel")}
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
    maxHeight: "90%",
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
