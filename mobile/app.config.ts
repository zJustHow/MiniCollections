import type { ConfigContext, ExpoConfig } from "expo/config";

function parseWebHost(webUrl: string | null): string | null {
  if (!webUrl) return null;
  try {
    return new URL(webUrl).hostname;
  } catch {
    return null;
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? null;
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL?.trim().replace(/\/$/, "") ?? null;
  const webHost = parseWebHost(webUrl);
  const baseAndroid = config.android ?? {};
  const baseIos = config.ios ?? {};

  return {
    ...(config as ExpoConfig),
    scheme: "minicollections",
    extra: {
      ...(typeof config.extra === "object" && config.extra != null ? config.extra : {}),
      apiUrl,
      webUrl,
    },
    ios: {
      ...baseIos,
      ...(webHost ? { associatedDomains: [`applinks:${webHost}`] } : {}),
    },
    android: {
      ...baseAndroid,
      ...(process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT === "true"
        ? { usesCleartextTraffic: true as const }
        : {}),
      ...(webHost
        ? {
            intentFilters: [
              {
                action: "VIEW",
                autoVerify: true,
                data: [
                  { scheme: "https", host: webHost, pathPrefix: "/brands" },
                  { scheme: "https", host: webHost, pathPrefix: "/groups" },
                ],
                category: ["BROWSABLE", "DEFAULT"],
              },
            ],
          }
        : {}),
    },
  };
};
