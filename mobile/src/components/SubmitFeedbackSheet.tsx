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
import { resolveMediaUrl, submitFeedback, uploadImage } from "@minicollections/api";
import NeuButton from "./neu/NeuButton";
import NeuInput from "./neu/NeuInput";
import BrandPickerField from "./BrandPickerField";
import { useLocale } from "../providers/LocaleProvider";
import type { FeedbackSubmissionType } from "../utils/feedbackLabels";
import { colors, radius, spacing } from "@minicollections/theme";

type SubmitFeedbackSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  initialBrandId?: string | null;
  initialBrandName?: string | null;
  initialSubmissionType?: FeedbackSubmissionType;
  initialNameEn?: string;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

const TYPE_OPTIONS: FeedbackSubmissionType[] = [
  "MISSING_MODEL",
  "BUG_REPORT",
  "DATA_CORRECTION",
];

const TITLE_KEY: Record<FeedbackSubmissionType, string> = {
  MISSING_MODEL: "reportModalTitleMissingModel",
  BUG_REPORT: "reportModalTitleBugReport",
  DATA_CORRECTION: "reportModalTitleDataCorrection",
};

export default function SubmitFeedbackSheet({
  visible,
  onClose,
  onSubmitted,
  initialBrandId = null,
  initialBrandName = null,
  initialSubmissionType = "MISSING_MODEL",
  initialNameEn = "",
}: SubmitFeedbackSheetProps) {
  const { t } = useLocale();
  const [submissionType, setSubmissionType] =
    useState<FeedbackSubmissionType>("MISSING_MODEL");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [useOtherBrand, setUseOtherBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [notes, setNotes] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSubmissionType(initialSubmissionType);
    setBrandId(initialBrandId);
    setBrandName(initialBrandName);
    setUseOtherBrand(false);
    setCustomBrandName("");
    setNameEn(initialNameEn);
    setNameZh("");
    setNotes("");
    setPickedImage(null);
    setError(null);
  };

  useEffect(() => {
    if (!visible) return;
    reset();
  }, [visible, initialBrandId, initialBrandName, initialSubmissionType, initialNameEn]);

  const handleClose = () => {
    reset();
    onClose();
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
      name: asset.fileName ?? "feedback.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
  };

  const handleSubmit = async () => {
    if (submissionType === "BUG_REPORT" && !nameEn.trim()) {
      setError(t("bugSubjectRequired"));
      return;
    }
    if (submissionType === "DATA_CORRECTION" && !notes.trim()) {
      setError(t("bugSubjectRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (pickedImage) {
        imageUrl = await uploadImage(pickedImage);
      }
      await submitFeedback({
        submission_type: submissionType,
        brand_id: useOtherBrand ? null : brandId ? Number(brandId) : null,
        custom_brand_name: useOtherBrand ? customBrandName.trim() || null : null,
        name_en: nameEn.trim() || null,
        name_zh: nameZh.trim() || null,
        image_url: imageUrl,
        notes: notes.trim() || null,
      });
      reset();
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t(TITLE_KEY[submissionType])}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.typeRow}>
              {TYPE_OPTIONS.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setSubmissionType(type)}
                  style={[styles.typeBtn, submissionType === type && styles.typeBtnActive]}
                >
                  <Text
                    style={[
                      styles.typeLabel,
                      submissionType === type && styles.typeLabelActive,
                    ]}
                    numberOfLines={2}
                  >
                    {t(
                      type === "MISSING_MODEL"
                        ? "feedbackTypeMissingModel"
                        : type === "BUG_REPORT"
                          ? "feedbackTypeBugReport"
                          : "feedbackTypeDataCorrection",
                    )}
                  </Text>
                </Pressable>
              ))}
            </View>

            {submissionType !== "BUG_REPORT" ? (
              <BrandPickerField
                brandId={brandId}
                brandName={brandName}
                useOtherBrand={useOtherBrand}
                customBrandName={customBrandName}
                onSelectCatalogBrand={(id, name) => {
                  setBrandId(id);
                  setBrandName(name);
                  setUseOtherBrand(false);
                  setCustomBrandName("");
                }}
                onSelectOtherBrand={() => {
                  setBrandId(null);
                  setBrandName(null);
                  setUseOtherBrand(true);
                }}
                onCustomBrandNameChange={setCustomBrandName}
                onClearBrand={() => {
                  setBrandId(null);
                  setBrandName(null);
                  setUseOtherBrand(false);
                  setCustomBrandName("");
                }}
              />
            ) : null}

            <NeuInput
              label={
                submissionType === "BUG_REPORT"
                  ? t("bugSubject")
                  : submissionType === "DATA_CORRECTION"
                    ? t("correctionModelName")
                    : t("nameEn")
              }
              value={nameEn}
              onChangeText={setNameEn}
            />

            {submissionType === "MISSING_MODEL" ? (
              <NeuInput label={t("nameZh")} value={nameZh} onChangeText={setNameZh} />
            ) : null}

            <NeuInput
              label={
                submissionType === "BUG_REPORT"
                  ? t("bugDescription")
                  : submissionType === "DATA_CORRECTION"
                    ? t("correctionDescription")
                    : t("additionalNotes")
              }
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <Text style={styles.coverLabel}>{t("image")}</Text>
            <View style={styles.coverWell}>
              {pickedImage?.uri ? (
                <Image source={{ uri: pickedImage.uri }} style={styles.coverImage} contentFit="cover" />
              ) : (
                <Text style={styles.coverPlaceholder}>{t("image")}</Text>
              )}
            </View>
            <NeuButton title={t("image")} variant="ghost" onPress={() => void pickImage()} />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <NeuButton
              title={t("submitReport")}
              loading={submitting}
              onPress={() => void handleSubmit()}
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
    maxHeight: "92%",
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
  typeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: 4,
    borderRadius: radius.card,
    backgroundColor: colors.sl,
    marginBottom: spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    borderRadius: radius.card - 2,
  },
  typeBtnActive: {
    backgroundColor: colors.bg,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  typeLabelActive: {
    color: colors.accent,
    fontWeight: "700",
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
