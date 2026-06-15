import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NeuButton from "./NeuButton";
import GroovedImage from "./GroovedImage";
import { deleteMySubmission, resolveMediaUrl } from "@minicollections/api";
import { useLocale } from "../providers/LocaleProvider";
import {
  feedbackStatusColor,
  feedbackStatusLabel,
  feedbackTypeLabel,
} from "../utils/feedbackLabels";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

export type FeedbackItem = {
  id: number | string;
  submission_type?: string;
  status?: string;
  name_en?: string | null;
  name_zh?: string | null;
  brand_name?: string | null;
  custom_brand_name?: string | null;
  notes?: string | null;
  image_url?: string | null;
  admin_note?: string | null;
  reject_reason?: string | null;
  submitted_at?: string | null;
  scale?: string | null;
};

type SubmissionDrawerProps = {
  item: FeedbackItem | null;
  onClose: () => void;
  onDeleted: () => void;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SubmissionDrawer({
  item,
  onClose,
  onDeleted,
}: SubmissionDrawerProps) {
  const { t } = useLocale();
  if (!item) return null;

  const title =
    item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—";
  const brand = item.brand_name || item.custom_brand_name;
  const imageUri = item.image_url ? resolveMediaUrl(item.image_url) : null;

  const confirmDelete = () => {
    Alert.alert(t("delete"), t("deleteModelContent"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => void handleDelete(),
      },
    ]);
  };

  const handleDelete = async () => {
    try {
      await deleteMySubmission(item.id);
      onDeleted();
      onClose();
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : t("failedToDeleteFeedback"));
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.tagRow}>
              <Text style={styles.typeTag}>{feedbackTypeLabel(item.submission_type, t)}</Text>
              <Text
                style={[
                  styles.statusTag,
                  { color: feedbackStatusColor(item.status) },
                ]}
              >
                {feedbackStatusLabel(item.status, t)}
              </Text>
            </View>

            <DetailRow label={t("nameEn")} value={item.name_en} />
            <DetailRow label={t("nameZh")} value={item.name_zh} />
            <DetailRow label={t("brand")} value={brand} />
            <DetailRow label={t("scale")} value={item.scale} />
            <DetailRow label={t("notes")} value={item.notes} />

            {imageUri ? (
              <View style={styles.imageBlock}>
                <Text style={styles.rowLabel}>{t("image")}</Text>
                <GroovedImage uri={imageUri} variant="detail" />
              </View>
            ) : null}

            {item.admin_note ? (
              <View style={styles.noteBlock}>
                <Text style={styles.noteHeading}>{t("adminReply")}</Text>
                <Text style={styles.noteText}>{item.admin_note}</Text>
              </View>
            ) : null}

            {item.reject_reason ? (
              <View style={[styles.noteBlock, styles.rejectBlock]}>
                <Text style={styles.noteHeading}>{t("rejectionReason")}</Text>
                <Text style={styles.noteText}>{item.reject_reason}</Text>
              </View>
            ) : null}

            <NeuButton title={t("delete")} variant="danger" onPress={confirmDelete} style={styles.deleteBtn} />
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
    maxHeight: "88%",
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
  tagRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  typeTag: {
    ...neuText.tag,
    color: colors.accent,
    backgroundColor: colors.sl,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusTag: {
    ...neuText.tag,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  row: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  imageBlock: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  noteBlock: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.sl,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    gap: spacing.xs,
  },
  rejectBlock: {
    borderLeftColor: colors.danger,
  },
  noteHeading: {
    ...neuText.badge,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  noteText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
});
