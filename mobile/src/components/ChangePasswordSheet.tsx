import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { updatePassword } from "@minicollections/api";
import NeuButton from "./NeuButton";
import NeuInput from "./NeuFormControl/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type ChangePasswordSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ChangePasswordSheet({
  visible,
  onClose,
  onSuccess,
}: ChangePasswordSheetProps) {
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentPassword) {
      setError(t("currentPasswordRequired"));
      return;
    }
    if (!newPassword) {
      setError(t("newPasswordRequired"));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("newPasswordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updatePassword({ currentPassword, newPassword });
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("passwordUpdateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("updatePassword")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <NeuInput
              label={t("currentPassword")}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <NeuInput
              label={t("newPassword")}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <NeuInput
              label={t("confirmPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <NeuButton
              title={t("updatePassword")}
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
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.md,
  },
});
