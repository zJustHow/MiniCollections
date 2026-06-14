import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import {
  approveSubmission,
  rejectSubmission,
  resolveMediaUrl,
} from "@minicollections/api";
import NeuButton from "./neu/NeuButton";
import NeuInput from "./neu/NeuInput";
import ApproveSubmissionSheet from "./ApproveSubmissionSheet";
import { useLocale } from "../providers/LocaleProvider";
import {
  feedbackStatusColor,
  feedbackStatusLabel,
  feedbackTypeLabel,
} from "../utils/feedbackLabels";
import { colors, spacing } from "@minicollections/theme";

export type AdminSubmissionItem = {
  id: number | string;
  submission_type?: string;
  status?: string;
  submitter_name?: string | null;
  name_en?: string | null;
  name_zh?: string | null;
  brand_name?: string | null;
  custom_brand_name?: string | null;
  brand_id?: number | string | null;
  notes?: string | null;
  image_url?: string | null;
  admin_note?: string | null;
  reject_reason?: string | null;
  submitted_at?: string | null;
  release_price_cny?: number | string | null;
  release_price_usd?: number | string | null;
  release_date?: string | null;
  series_id?: number | string | null;
  category_id?: number | string | null;
  scale_id?: number | string | null;
  scale?: string | null;
};

type AdminSubmissionDetailSheetProps = {
  item: AdminSubmissionItem | null;
  onClose: () => void;
  onUpdated: () => void;
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

export default function AdminSubmissionDetailSheet({
  item,
  onClose,
  onUpdated,
}: AdminSubmissionDetailSheetProps) {
  const { t } = useLocale();
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [approveVisible, setApproveVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const isPending = item.status === "PENDING";
  const isMissingModel = item.submission_type === "MISSING_MODEL";
  const title = item.name_en || item.name_zh || item.notes?.slice(0, 60) || `#${item.id}`;
  const brand = item.brand_name || item.custom_brand_name;
  const imageUri = item.image_url ? resolveMediaUrl(item.image_url) : null;

  const handleResolve = async () => {
    setSubmitting(true);
    try {
      await approveSubmission(item.id, {
        brand_id: null,
        name_en: null,
        name_zh: null,
        image_url: null,
        release_price_cny: null,
        release_price_usd: null,
        release_date: null,
        category_id: null,
        scale_id: null,
        admin_note: adminNote.trim() || null,
      });
      Alert.alert(t("submissionResolved"));
      onUpdated();
      onClose();
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : t("failedToResolve"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await rejectSubmission(item.id, rejectReason.trim() || null);
      Alert.alert(isMissingModel ? t("submissionRejected") : t("submissionClosed"));
      onUpdated();
      onClose();
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : t("failedToReject"));
    } finally {
      setSubmitting(false);
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
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.tagRow}>
              <Text style={styles.typeTag}>{feedbackTypeLabel(item.submission_type, t)}</Text>
              <Text style={[styles.statusTag, { color: feedbackStatusColor(item.status) }]}>
                {feedbackStatusLabel(item.status, t)}
              </Text>
            </View>

            <DetailRow label={t("submitter")} value={item.submitter_name} />
            <DetailRow label={t("brand")} value={brand} />
            <DetailRow label={t("nameEn")} value={item.name_en} />
            <DetailRow label={t("nameZh")} value={item.name_zh} />
            <DetailRow label={t("scale")} value={item.scale} />
            <DetailRow label={t("notes")} value={item.notes} />

            {imageUri ? (
              <View style={styles.imageBlock}>
                <Text style={styles.rowLabel}>{t("image")}</Text>
                <Image source={{ uri: imageUri }} style={styles.image} contentFit="contain" />
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

            {isPending ? (
              <View style={styles.actions}>
                {isMissingModel ? (
                  <NeuButton
                    title={t("approveSubmission")}
                    onPress={() => setApproveVisible(true)}
                  />
                ) : (
                  <>
                    <NeuInput
                      label={t("adminNote")}
                      value={adminNote}
                      onChangeText={setAdminNote}
                      multiline
                    />
                    <NeuButton
                      title={t("resolveSubmission")}
                      loading={submitting}
                      onPress={() => void handleResolve()}
                    />
                  </>
                )}
                <NeuInput
                  label={isMissingModel ? t("rejectReason") : t("closeReason")}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                />
                <NeuButton
                  title={isMissingModel ? t("rejectSubmission") : t("closeSubmission")}
                  variant="ghost"
                  loading={submitting}
                  onPress={() => void handleReject()}
                  style={styles.rejectBtn}
                />
              </View>
            ) : null}

            <NeuButton title={t("cancel")} variant="ghost" onPress={onClose} />
          </ScrollView>
        </View>
      </View>

      <ApproveSubmissionSheet
        visible={approveVisible}
        submission={item}
        onClose={() => setApproveVisible(false)}
        onApproved={() => {
          Alert.alert(t("submissionApproved"));
          onUpdated();
          onClose();
        }}
      />
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
  tagRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  typeTag: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accent,
  },
  statusTag: {
    fontSize: 12,
    fontWeight: "700",
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
  image: {
    width: "100%",
    aspectRatio: 1.2,
    backgroundColor: colors.sl,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  noteText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  rejectBtn: {
    borderColor: colors.danger,
  },
});
