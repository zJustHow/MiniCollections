import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { resetPassword, sendForgotPasswordCode } from "@minicollections/api";
import { formatPhoneIdentifier } from "@minicollections/core";
import AuthTypeToggle, { type AuthChannel } from "../components/AuthTypeToggle";
import PhoneField from "../components/PhoneField";
import NeuButton from "../components/neu/NeuButton";
import NeuInput from "../components/neu/NeuInput";
import ScreenHeader from "../components/ScreenHeader";
import useCodeCountdown from "../hooks/useCodeCountdown";
import { PHONE_AUTH_ENABLED } from "../constants/authFeatures";
import { useLocale } from "../providers/LocaleProvider";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useLocale();
  const { countdown, start } = useCodeCountdown();
  const [authType, setAuthType] = useState<AuthChannel>("email");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+86");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveTarget = () => {
    if (authType === "email") {
      const target = email.trim();
      if (!target) {
        setError(t("emailRequired"));
        return null;
      }
      return { target, codeType: "EMAIL" as const };
    }
    if (!/^\d{5,15}$/.test(phoneNumber.trim())) {
      setError(t("phoneInvalid"));
      return null;
    }
    return {
      target: formatPhoneIdentifier(countryCode, phoneNumber.trim()),
      codeType: "PHONE" as const,
    };
  };

  const handleSendCode = async () => {
    const resolved = resolveTarget();
    if (!resolved) return;
    setSendingCode(true);
    setError(null);
    try {
      await sendForgotPasswordCode(resolved.target, resolved.codeType);
      start(60);
      Alert.alert(t("codeSent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("codeRequired"));
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = useCallback(async () => {
    if (!code.trim()) {
      setError(t("codeRequired"));
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

    setLoading(true);
    setError(null);
    try {
      const payload: {
        code: string;
        new_password: string;
        email?: string;
        phone?: string;
      } = {
        code: code.trim(),
        new_password: newPassword,
      };
      if (authType === "email") {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          setError(t("emailRequired"));
          setLoading(false);
          return;
        }
        payload.email = trimmedEmail;
      } else {
        if (!/^\d{5,15}$/.test(phoneNumber.trim())) {
          setError(t("phoneInvalid"));
          setLoading(false);
          return;
        }
        payload.phone = formatPhoneIdentifier(countryCode, phoneNumber.trim());
      }
      await resetPassword(payload);
      Alert.alert(t("passwordResetSuccess"), undefined, [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resetPassword"));
    } finally {
      setLoading(false);
    }
  }, [
    authType,
    code,
    confirmPassword,
    countryCode,
    email,
    navigation,
    newPassword,
    phoneNumber,
    t,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={t("resetPassword")}
        showBack
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AuthTypeToggle
            value={authType}
            onChange={(next) => {
              if (next === "phone" && !PHONE_AUTH_ENABLED) return;
              setAuthType(next);
              setError(null);
            }}
          />

          {authType === "email" ? (
            <NeuInput
              label={t("email")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          ) : (
            <PhoneField
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
            />
          )}
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
            title={t("resetPassword")}
            loading={loading}
            onPress={() => void onSubmit()}
            style={styles.submit}
          />

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>{t("backToSignIn")}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.xs,
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
    marginVertical: spacing.sm,
  },
  submit: {
    marginTop: spacing.sm,
  },
  link: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.accent,
    fontWeight: "700",
  },
});
