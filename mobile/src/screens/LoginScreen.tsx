import React, { useCallback, useState } from "react";
import {
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
import { CommonActions } from "@react-navigation/native";
import { formatPhoneIdentifier } from "@minicollections/core";
import AuthTypeToggle, { type AuthChannel } from "../components/AuthTypeToggle";
import PhoneField from "../components/PhoneField";
import NeuButton from "../components/neu/NeuButton";
import NeuInput from "../components/neu/NeuInput";
import ScreenHeader from "../components/ScreenHeader";
import { PHONE_AUTH_ENABLED } from "../constants/authFeatures";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "@minicollections/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation, route }: Props) {
  const { login } = useAuth();
  const { t } = useLocale();
  const returnTab = route.params?.returnTab;
  const [authType, setAuthType] = useState<AuthChannel>("email");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+86");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    setError(null);
    const identifier =
      authType === "phone"
        ? formatPhoneIdentifier(countryCode, phoneNumber.trim())
        : email.trim();
    if (authType === "phone" && !/^\d{5,15}$/.test(phoneNumber.trim())) {
      setError(t("phoneInvalid"));
      return;
    }
    if (authType === "email" && !identifier) {
      setError(t("emailRequired"));
      return;
    }
    setLoading(true);
    try {
      await login({
        identifier,
        password,
        loginType: authType,
      });
      if (returnTab) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "MainTabs", params: { screen: returnTab } }],
          }),
        );
      } else {
        navigation.goBack();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("passwordRequired"));
    } finally {
      setLoading(false);
    }
  }, [authType, countryCode, email, login, navigation, password, phoneNumber, returnTab, t]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={t("signIn")}
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
          <Text style={styles.title}>
            Mini <Text style={styles.titleAccent}>Collections</Text>
          </Text>

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
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
            />
          ) : (
            <PhoneField
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
            />
          )}
          <NeuInput
            label={t("password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <NeuButton
            title={t("signIn")}
            loading={loading}
            onPress={onSubmit}
            style={styles.submit}
          />

          <View style={styles.links}>
            <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.link}>{t("forgotPassword")}</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.link}>{t("signUp")}</Text>
            </Pressable>
          </View>
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
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.titleSize,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  titleAccent: {
    color: colors.accent,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.sm,
  },
  links: {
    marginTop: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  link: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 15,
  },
});
