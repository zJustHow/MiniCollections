import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getBrandObjectById,
  resolveMediaUrl,
  updateUserObject,
  uploadImage,
} from "@minicollections/api";
import {
  displayPurchasePriceFromObject,
  normalizePurchaseDateInput,
  purchasePriceFromFormValue,
} from "@minicollections/core";
import NeuButton from "./NeuButton";
import GroovedImage from "./GroovedImage";
import NeuInput from "./NeuFormControl/NeuInput";
import ModelPickerField, { type CatalogModelOption } from "./ModelPickerField";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

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

type EditUserObjectModalProps = {
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

export default function EditUserObjectModal({
  visible,
  onClose,
  onSaved,
  groupId,
  userObject,
}: EditUserObjectModalProps) {
  const { t } = useLocale();
  const [selectedModel, setSelectedModel] = useState<CatalogModelOption | null>(null);
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [catalogImageUrl, setCatalogImageUrl] = useState<string | null>(null);
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
    setCatalogImageUrl(null);
    setPickedImage(null);
    setError(null);

    const brandObjectId = userObject.brand_object_id ?? userObject.brandObjectId;
    if (!brandObjectId) {
      setSelectedModel(null);
      return;
    }

    let cancelled = false;
    getBrandObjectById(brandObjectId)
      .then((brandObject) => {
        if (cancelled) return;
        setSelectedModel({
          id: brandObject.id ?? brandObjectId,
          name: brandObject.name,
          image_url: brandObject.image_url ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedModel({ id: brandObjectId, name: "" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visible, userObject]);

  const handleSelectModel = (model: CatalogModelOption | null) => {
    setSelectedModel(model);
    if (model) {
      if (model.name?.trim()) {
        setName(model.name.trim());
      }
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

    setSubmitting(true);
    setError(null);
    try {
      let imageUrl = pickedImage ? null : (existingImageUrl ?? catalogImageUrl);
      if (pickedImage) {
        imageUrl = await uploadImage(pickedImage);
      } else if (!imageUrl && catalogImageUrl) {
        imageUrl = catalogImageUrl;
      }
      await updateUserObject(groupId, userObject.id, {
        brand_object_id:
          selectedModel?.id != null && selectedModel.id !== ""
            ? Number(selectedModel.id)
            : null,
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
    (existingImageUrl
      ? resolveMediaUrl(existingImageUrl)
      : catalogImageUrl
        ? resolveMediaUrl(catalogImageUrl)
        : null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("editModel")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ModelPickerField
              selectedModel={selectedModel}
              onSelectModel={handleSelectModel}
            />
            <NeuInput label={t("name")} value={name} onChangeText={setName} />
            <Text style={styles.coverLabel}>{t("image")}</Text>
            <GroovedImage uri={previewUri ?? undefined} variant="cover" />
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
    ...neuText.modalTitle,
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
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.md,
  },
});
