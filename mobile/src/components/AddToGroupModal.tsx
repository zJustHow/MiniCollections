import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  createGroup,
  createUserObject,
  getGroupsPage,
  resolveMediaUrl,
  uploadImage,
} from "@minicollections/api";
import {
  normalizePurchaseDateInput,
  purchasePriceFromFormValue,
} from "@minicollections/core";
import NeuButton from "./NeuButton";
import GroovedImage from "./GroovedImage";
import NeuInput from "./NeuFormControl/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type GroupOption = {
  id: number | string;
  name?: string;
};

type AddToGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (groupId: string, groupName: string) => void;
  brandObjectId: number | string;
  defaultName: string;
  defaultImageUrl?: string | null;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

export default function AddToGroupModal({
  visible,
  onClose,
  onSuccess,
  brandObjectId,
  defaultName,
  defaultImageUrl,
}: AddToGroupModalProps) {
  const { t } = useLocale();
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [name, setName] = useState(defaultName);
  const [notes, setNotes] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = () => {
    setLoadingGroups(true);
    return getGroupsPage({ page: 0, size: 100 })
      .then((data) => setGroups(Array.isArray(data?.content) ? data.content : []))
      .catch((err) => {
        setError(err instanceof Error ? err.message : t("failedToLoadGroups"));
      })
      .finally(() => setLoadingGroups(false));
  };

  useEffect(() => {
    if (!visible) return;
    setName(defaultName);
    setNotes("");
    setPurchasePrice("");
    setPurchaseDate("");
    setNewGroupName("");
    setSelectedGroupId(null);
    setPickedImage(null);
    setError(null);
    void loadGroups();
  }, [visible, defaultName, t]);

  const handleCreateGroup = async () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      setError(t("nameRequired"));
      return;
    }

    setCreatingGroup(true);
    setError(null);
    try {
      const created = await createGroup({ name: trimmed, image_url: null });
      await loadGroups();
      setSelectedGroupId(String(created.id));
      setNewGroupName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToCreateGroup"));
    } finally {
      setCreatingGroup(false);
    }
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
    if (!selectedGroupId) {
      setError(t("groupRequired"));
      return;
    }
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
      let imageUrl = defaultImageUrl ?? null;
      if (pickedImage) {
        imageUrl = await uploadImage(pickedImage);
      }
      await createUserObject(selectedGroupId, {
        brand_object_id: brandObjectId,
        name: name.trim(),
        image_url: imageUrl,
        purchase_date: normalizedDate ?? null,
        ...purchasePriceFromFormValue(purchasePrice),
        other_notes: notes.trim() || null,
      });
      const groupName =
        groups.find((g) => String(g.id) === selectedGroupId)?.name ?? "";
      onSuccess(selectedGroupId, groupName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToAddModelToGroup"));
    } finally {
      setSubmitting(false);
    }
  };

  const previewUri =
    pickedImage?.uri ??
    (defaultImageUrl ? resolveMediaUrl(defaultImageUrl) : null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("addToMyGroup")}</Text>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.coverLabel}>{t("image")}</Text>
            <GroovedImage uri={previewUri ?? undefined} variant="cover" />
            <NeuButton title={t("image")} variant="ghost" onPress={() => void pickImage()} />
            <NeuInput label={t("name")} value={name} onChangeText={setName} />
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

            <Text style={styles.groupLabel}>{t("group")}</Text>
            {loadingGroups ? (
              <ActivityIndicator color={colors.accent} style={styles.groupLoading} />
            ) : groups.length === 0 ? (
              <Text style={styles.emptyGroups}>{t("addGroup")}</Text>
            ) : (
              groups.map((group) => {
                const id = String(group.id);
                const selected = selectedGroupId === id;
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    onPress={() => setSelectedGroupId(id)}
                    style={[styles.groupRow, selected && styles.groupRowSelected]}
                  >
                    <Text style={[styles.groupName, selected && styles.groupNameSelected]}>
                      {group.name ?? id}
                    </Text>
                  </Pressable>
                );
              })
            )}

            <View style={styles.createBlock}>
              <Text style={styles.createLabel}>{t("addGroup")}</Text>
              <NeuInput
                label={t("name")}
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <NeuButton
                title={t("addGroup")}
                variant="ghost"
                loading={creatingGroup}
                onPress={() => void handleCreateGroup()}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeuButton
              title={t("addToGroup")}
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
  dismissArea: {
    flex: 1,
  },
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
  groupLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  groupLoading: {
    paddingVertical: spacing.md,
  },
  emptyGroups: {
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
  groupRow: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  groupRowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.bg,
  },
  groupName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  groupNameSelected: {
    color: colors.accent,
  },
  createBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  createLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: neuText.body.fontWeight,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  submit: {
    marginTop: spacing.md,
  },
});
