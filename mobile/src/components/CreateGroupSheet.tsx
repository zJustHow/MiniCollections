import React, { useState } from "react";
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
import { createGroup, uploadImage, resolveMediaUrl } from "@minicollections/api";
import NeuButton from "./neu/NeuButton";
import NeuInput from "./neu/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";

type CreateGroupSheetProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

export default function CreateGroupSheet({
  visible,
  onClose,
  onCreated,
}: CreateGroupSheetProps) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPickedImage(null);
    setUploadedUrl(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickCover = async () => {
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
      name: asset.fileName ?? "group-cover.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
    setUploadedUrl(null);
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("nameRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let imageUrl = uploadedUrl;
      if (pickedImage && !imageUrl) {
        imageUrl = await uploadImage(pickedImage);
        setUploadedUrl(imageUrl);
      }

      await createGroup({
        name: trimmed,
        image_url: imageUrl ?? null,
      });
      onCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToCreateGroup"));
    } finally {
      setSubmitting(false);
    }
  };

  const previewUri = pickedImage?.uri ?? (uploadedUrl ? resolveMediaUrl(uploadedUrl) : null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("addGroup")}</Text>
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
            <NeuButton title={t("image")} variant="ghost" onPress={() => void pickCover()} />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeuButton
              title={t("addGroup")}
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
    aspectRatio: 1.6,
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
