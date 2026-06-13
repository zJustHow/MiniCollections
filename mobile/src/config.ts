import { Platform } from "react-native";
import Constants from "expo-constants";

const devHost =
  Platform.OS === "android" ? "10.0.2.2" : "localhost";

function resolveApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (__DEV__) {
    return `http://${devHost}:8080`;
  }

  return "https://minicollections.example.com";
}

export const API_BASE_URL = resolveApiBaseUrl();

export const APP_EXTRA = Constants.expoConfig?.extra ?? {};
