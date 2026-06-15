import { Platform } from "react-native";
import Constants from "expo-constants";
import { normalizePublicUrl } from "../expoPublicUrl";

const devHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

type AppExtra = {
  apiUrl?: unknown;
};

function readConfiguredApiUrl(): string | undefined {
  const fromEnv = normalizePublicUrl(process.env.EXPO_PUBLIC_API_URL);
  if (fromEnv) return fromEnv;

  const fromExtra = normalizePublicUrl(
    (Constants.expoConfig?.extra as AppExtra | undefined)?.apiUrl,
  );
  if (fromExtra) return fromExtra;

  return undefined;
}

function resolveApiBaseUrl() {
  const configured = readConfiguredApiUrl();
  if (configured) return configured;

  if (__DEV__) {
    return `http://${devHost}:8080`;
  }

  return "https://minicollections.example.com";
}

export const API_BASE_URL = resolveApiBaseUrl();

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export const IS_DEV_BUILD = __DEV__;

export const APP_EXTRA = Constants.expoConfig?.extra ?? {};
