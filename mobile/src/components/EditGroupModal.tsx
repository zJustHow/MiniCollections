import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  deleteGroup,
  getGroupById,
  resolveMediaUrl,
  updateGroup,
  uploadImage,
} from "@minicollections/api";
import NeuButton from "./NeuButton";
import GroovedImage from "./GroovedImage";
import NeuInput from "./NeuFormControl/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type EditGroupModalProps = {
  visible: boolean;
  groupId: string;
  onClose: () => void;
  onUpdated: (name: string) => void;
  onDeleted: () => void;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

export default function EditGroupModal({
  visible,
  groupId,
  onClose,
  onUpdated,
  onDeleted,
}: EditGroupModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !groupId) return;
    setPickedImage(null);
    setError(null);
    setLoading(true);
    getGroupById(groupId)
      .then((group) => {
        setName(group?.name ?? "");
        setExistingImageUrl(group?.image_url ?? null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t("failedToLoadGroups"));
      })
      .finally(() => setLoading(false));
  }, [visible, groupId, t]);

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
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("nameRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let imageUrl = existingImageUrl;
      if (pickedImage) {
        imageUrl = await uploadImage(pickedImage);
      }
      await updateGroup(groupId, {
        name: trimmed,
        image_url: imageUrl ?? null,
      });
      onUpdated(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToUpdateGroup"));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(t("deleteGroupTitle"), t("deleteGroupContent"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => void handleDelete(),
      },
    ]);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteGroup(groupId);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToDeleteGroup"));
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
          <Text style={styles.title}>{t("editGroup")}</Text>
          {loading ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : (
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <NeuInput label={t("name")} value={name} onChangeText={setName} />
              <Text style={styles.coverLabel}>{t("image")}</Text>
              <GroovedImage uri={previewUri ?? undefined} variant="cover" />
              <NeuButton title={t("image")} variant="ghost" onPress={() => void pickCover()} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <NeuButton
                title={t("save")}
                loading={submitting}
                onPress={() => void handleSave()}
                style={styles.submit}
              />
              <NeuButton
                title={t("delete")}
                variant="ghost"
                onPress={confirmDelete}
                style={styles.deleteBtn}
              />
              <NeuButton title={t("cancel")} variant="ghost" onPress={onClose} />
            </ScrollView>
          )}
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
  loading: {
    padding: spacing.lg,
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
  deleteBtn: {
    borderColor: colors.danger,
  },
});
