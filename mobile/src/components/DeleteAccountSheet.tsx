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
import { deleteAccount } from "@minicollections/api";
import NeuButton from "./NeuButton";
import NeuInput from "./NeuFormControl/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type DeleteAccountSheetProps = {
  visible: boolean;
  passwordRequired: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteAccountSheet({
  visible,
  passwordRequired,
  onClose,
  onDeleted,
}: DeleteAccountSheetProps) {
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPassword("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (passwordRequired && !password) {
      setError(t("currentPasswordRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await deleteAccount(passwordRequired ? { password } : {});
      reset();
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteAccountFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(t("deleteAccount"), t("deleteAccountWarning"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("deleteAccount"),
        style: "destructive",
        onPress: () => void handleSubmit(),
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("deleteAccount")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.warning}>{t("deleteAccountWarning")}</Text>
            {passwordRequired ? (
              <NeuInput
                label={t("deleteAccountPassword")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <NeuButton
              title={t("deleteAccount")}
              variant="danger"
              loading={submitting}
              onPress={confirmDelete}
              style={styles.deleteBtn}
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
    maxHeight: "70%",
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
    color: colors.danger,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  warning: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
});
