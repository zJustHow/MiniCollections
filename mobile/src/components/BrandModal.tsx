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
  adminCreateBrand,
  uploadBrandLogo,
  uploadImage,
} from "@minicollections/api";
import NeuButton from "./NeuButton";
import NeuInput from "./NeuFormControl/NeuInput";
import GroovedImage from "./GroovedImage";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type BrandModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

export default function BrandModal({ visible, onClose, onCreated }: BrandModalProps) {
  const { t } = useLocale();
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setNameEn("");
    setNameZh("");
    setAbbreviation("");
    setPickedImage(null);
    setError(null);
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const pickLogo = async () => {
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
      name: asset.fileName ?? "brand-logo.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
  };

  const handleCreate = async () => {
    const trimmedEn = nameEn.trim();
    if (!trimmedEn) {
      setError(t("nameRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await adminCreateBrand({
        name_en: trimmedEn,
        name_zh: nameZh.trim() || null,
        abbreviation: abbreviation.trim() || null,
        image_url: null,
      });

      if (pickedImage && created?.id != null) {
        await uploadBrandLogo(created.id, pickedImage);
      }

      onCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToCreateBrand"));
    } finally {
      setSubmitting(false);
    }
  };

  const previewUri = pickedImage?.uri ?? undefined;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("addBrand")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <NeuInput label={t("nameEn")} value={nameEn} onChangeText={setNameEn} />
            <NeuInput label={t("nameZh")} value={nameZh} onChangeText={setNameZh} />
            <NeuInput
              label={t("abbreviation")}
              value={abbreviation}
              onChangeText={setAbbreviation}
              placeholder={t("abbreviationPlaceholder")}
            />

            <Text style={styles.coverLabel}>{t("image")}</Text>
            <GroovedImage uri={previewUri} variant="brand" />
            <NeuButton title={t("image")} variant="ghost" onPress={() => void pickLogo()} />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeuButton
              title={t("addBrand")}
              loading={submitting}
              onPress={() => void handleCreate()}
              style={styles.submit}
            />
            <NeuButton title={t("cancel")} variant="ghost" onPress={handleClose} />
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
