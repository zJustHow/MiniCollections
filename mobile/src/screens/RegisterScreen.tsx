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
import { signup, sendCode } from "@minicollections/api";
import { formatPhoneIdentifier } from "@minicollections/core";
import AuthTypeToggle, { type AuthChannel } from "../components/AuthTypeToggle";
import PhoneField from "../components/PhoneField";
import NeuButton from "../components/NeuButton";
import NeuInput from "../components/NeuFormControl/NeuInput";
import ScreenHeader from "../components/ScreenHeader";
import useCodeCountdown from "../hooks/useCodeCountdown";
import { PHONE_AUTH_ENABLED } from "../constants/authFeatures";
import { useLocale } from "../providers/LocaleProvider";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { t, locale, setLocale } = useLocale();
  const { countdown, start } = useCodeCountdown();
  const [authType, setAuthType] = useState<AuthChannel>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+86");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
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
      await sendCode(resolved.target, resolved.codeType);
      start(60);
      Alert.alert(t("codeSent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("codeRequired"));
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError(t("signupNameRequired"));
      return;
    }
    if (!code.trim()) {
      setError(t("codeRequired"));
      return;
    }
    if (!password) {
      setError(t("passwordRequired"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: {
        name: string;
        password: string;
        code: string;
        preferred_locale: string;
        email?: string;
        phone?: string;
      } = {
        name: name.trim(),
        password,
        code: code.trim(),
        preferred_locale: locale,
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
      await signup(payload);
      setLocale(locale);
      Alert.alert(t("registerSuccess"), undefined, [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register"));
    } finally {
      setLoading(false);
    }
  }, [
    authType,
    code,
    countryCode,
    email,
    locale,
    name,
    navigation,
    password,
    phoneNumber,
    setLocale,
    t,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={t("register")}
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

          <NeuInput label={t("username")} value={name} onChangeText={setName} />
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
            label={t("password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <NeuButton
            title={t("register")}
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
    fontWeight: neuText.body.fontWeight,
  },
});
