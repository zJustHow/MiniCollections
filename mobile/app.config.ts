import type { ConfigContext, ExpoConfig } from "expo/config";

function normalizePublicUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, "");
}

function parseWebHost(webUrl: string | null): string | null {
  if (!webUrl) return null;
  try {
    return new URL(webUrl).hostname;
  } catch {
    return null;
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = normalizePublicUrl(process.env.EXPO_PUBLIC_API_URL);
  const webUrl = normalizePublicUrl(process.env.EXPO_PUBLIC_WEB_URL);
  const webHost = parseWebHost(webUrl ?? null);
  const baseAndroid = config.android ?? {};
  const baseIos = config.ios ?? {};
  const baseExtra =
    typeof config.extra === "object" && config.extra != null ? { ...config.extra } : {};
  delete baseExtra.apiUrl;
  delete baseExtra.webUrl;

  return {
    ...(config as ExpoConfig),
    scheme: "minicollections",
    extra: {
      ...baseExtra,
      ...(apiUrl ? { apiUrl } : {}),
      ...(webUrl ? { webUrl } : {}),
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
