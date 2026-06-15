import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { sendCode, updateIdentifier } from "@minicollections/api";
import NeuButton from "./NeuButton";
import NeuInput from "./NeuFormControl/NeuInput";
import useCodeCountdown from "../hooks/useCodeCountdown";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type UpdateEmailSheetProps = {
  visible: boolean;
  currentEmail?: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UpdateEmailSheet({
  visible,
  currentEmail,
  onClose,
  onSuccess,
}: UpdateEmailSheetProps) {
  const { t } = useLocale();
  const { countdown, start, reset } = useCodeCountdown();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setEmail(currentEmail ?? "");
    setCode("");
    setError(null);
    reset();
  }, [visible, currentEmail, reset]);

  const resetForm = () => {
    setEmail("");
    setCode("");
    setError(null);
    reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t("emailRequired"));
      return null;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError(t("emailInvalid"));
      return null;
    }
    return trimmed;
  };

  const handleSendCode = async () => {
    const trimmed = validateEmail();
    if (!trimmed) return;

    setSendingCode(true);
    setError(null);
    try {
      await sendCode(trimmed, "EMAIL");
      start(60);
      Alert.alert(t("codeSent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("codeRequired"));
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async () => {
    const trimmed = validateEmail();
    if (!trimmed) return;
    if (!code.trim()) {
      setError(t("codeRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateIdentifier({
        type: "email",
        identifier: trimmed,
        code: code.trim(),
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("emailUpdateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("updateEmail")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <NeuInput
              label={t("loginEmail")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <View style={styles.codeRow}>
              <View style={styles.codeInput}>
                <NeuInput
                  label={t("verificationCode")}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
              </View>
              <NeuButton
                title={countdown > 0 ? `${countdown}s` : t("sendCode")}
                variant="ghost"
                disabled={countdown > 0 || sendingCode}
                loading={sendingCode}
                onPress={() => void handleSendCode()}
                style={styles.codeBtn}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <NeuButton
              title={t("updateEmail")}
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
    maxHeight: "80%",
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
  codeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  codeInput: {
    flex: 1,
  },
  codeBtn: {
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.md,
  },
});
