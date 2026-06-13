import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  resolveMediaUrl,
  updateLocale,
  updateProfile,
  uploadAvatar,
} from "@minicollections/api";
import ScreenHeader from "../components/ScreenHeader";
import NeuButton from "../components/neu/NeuButton";
import NeuInput from "../components/neu/NeuInput";
import ChangePasswordSheet from "../components/ChangePasswordSheet";
import BindPhoneSheet from "../components/BindPhoneSheet";
import DeleteAccountSheet from "../components/DeleteAccountSheet";
import { PHONE_AUTH_ENABLED } from "../constants/authFeatures";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "@minicollections/theme";

export default function ProfileScreen() {
  const { authed, profile, logout, refreshProfile } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const rootNavigation = navigation.getParent()?.getParent();

  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [localeLoading, setLocaleLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  const avatarUri = resolveMediaUrl(profile?.avatar_url ?? undefined);
  const passwordSet = Boolean(profile?.password_set);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("uploadFailed"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setAvatarLoading(true);
    try {
      await uploadAvatar({
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
      await refreshProfile();
      Alert.alert(t("avatarUpdated"));
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : t("avatarUploadFailed"));
    } finally {
      setAvatarLoading(false);
    }
  };

  const saveDisplayName = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      Alert.alert(t("displayNameRequired"));
      return;
    }
    if (trimmed.length > 64) {
      Alert.alert(t("displayNameMax"));
      return;
    }
    setSavingName(true);
    try {
      await updateProfile({ displayName: trimmed });
      await refreshProfile();
      Alert.alert(t("displayNameUpdated"));
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : t("updateFailed"));
    } finally {
      setSavingName(false);
    }
  };

  const changeLocale = useCallback(
    async (next: "en-US" | "zh-CN") => {
      if (next === locale) return;
      setLocale(next);
      if (!authed) return;
      setLocaleLoading(true);
      try {
        await updateLocale(next);
        await refreshProfile();
      } catch (err) {
        Alert.alert(err instanceof Error ? err.message : t("updateFailed"));
      } finally {
        setLocaleLoading(false);
      }
    },
    [authed, locale, refreshProfile, setLocale, t],
  );

  const handleAccountDeleted = async () => {
    Alert.alert(t("deleteAccountSuccess"));
    await logout();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader title={t("profile")} />
      <ScrollView contentContainerStyle={styles.content}>
        {authed && profile ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => void pickAvatar()}
              style={styles.avatarWrap}
              disabled={avatarLoading}
            >
              <View style={styles.avatarRing}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {(profile.display_name ?? profile.email ?? "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                {avatarLoading ? (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color={colors.accent} />
                  </View>
                ) : null}
              </View>
              <Text style={styles.avatarHint}>{t("image")}</Text>
            </Pressable>

            <View style={styles.card}>
              <NeuInput
                label={t("displayName")}
                value={displayName}
                onChangeText={setDisplayName}
              />
              <NeuButton
                title={t("save")}
                loading={savingName}
                onPress={() => void saveDisplayName()}
              />
            </View>

            {profile.email ? (
              <View style={styles.card}>
                <Text style={styles.label}>{t("email")}</Text>
                <Text style={styles.value}>{profile.email}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.label}>{t("phoneNumber")}</Text>
              <Text style={styles.value}>{profile.phone ?? "—"}</Text>
              <NeuButton
                title={
                  profile.phone
                    ? PHONE_AUTH_ENABLED
                      ? t("updatePhone")
                      : `${t("updatePhone")} (${t("underDevelopment")})`
                    : PHONE_AUTH_ENABLED
                      ? t("bindPhone")
                      : `${t("bindPhone")} (${t("underDevelopment")})`
                }
                variant="ghost"
                disabled={!PHONE_AUTH_ENABLED}
                onPress={() => setPhoneVisible(true)}
                style={styles.action}
              />
            </View>

            <NeuButton
              title={t("updatePassword")}
              variant="ghost"
              onPress={() => setPasswordVisible(true)}
              style={styles.action}
            />
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.guest}>{t("signIn")}</Text>
            <NeuButton
              title={t("signIn")}
              onPress={() => rootNavigation?.navigate("Login")}
              style={styles.action}
            />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>{t("language")}</Text>
          <View style={styles.localeRow}>
            <NeuButton
              title="English"
              variant={locale === "en-US" ? "primary" : "ghost"}
              disabled={localeLoading}
              onPress={() => void changeLocale("en-US")}
              style={styles.localeBtn}
            />
            <NeuButton
              title="中文"
              variant={locale === "zh-CN" ? "primary" : "ghost"}
              disabled={localeLoading}
              onPress={() => void changeLocale("zh-CN")}
              style={styles.localeBtn}
            />
          </View>
        </View>

        {authed ? (
          <>
            <NeuButton
              title={t("logout")}
              variant="ghost"
              onPress={() => void logout()}
              style={styles.action}
            />
            <NeuButton
              title={t("deleteAccount")}
              variant="ghost"
              onPress={() => setDeleteVisible(true)}
              style={styles.deleteBtn}
            />
          </>
        ) : null}
      </ScrollView>

      <ChangePasswordSheet
        visible={passwordVisible}
        onClose={() => setPasswordVisible(false)}
        onSuccess={() => Alert.alert(t("passwordUpdated"))}
      />
      <BindPhoneSheet
        visible={phoneVisible}
        onClose={() => setPhoneVisible(false)}
        onSuccess={async () => {
          await refreshProfile();
          Alert.alert(t("phoneUpdated"));
        }}
      />
      <DeleteAccountSheet
        visible={deleteVisible}
        passwordRequired={passwordSet}
        onClose={() => setDeleteVisible(false)}
        onDeleted={() => void handleAccountDeleted()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarWrap: {
    alignSelf: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  avatarRing: {
    width: 96,
    height: 96,
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.accent,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  guest: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  localeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  localeBtn: {
    flex: 1,
  },
  action: {
    marginTop: spacing.sm,
  },
  deleteBtn: {
    marginTop: spacing.sm,
    borderColor: colors.danger,
  },
});
