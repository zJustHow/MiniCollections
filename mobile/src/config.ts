import { Platform } from "react-native";
import Constants from "expo-constants";

const devHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

type AppExtra = {
  apiUrl?: string | null;
};

function readConfiguredApiUrl(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const fromExtra = (Constants.expoConfig?.extra as AppExtra | undefined)?.apiUrl?.trim();
  if (fromExtra) return fromExtra.replace(/\/$/, "");

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
