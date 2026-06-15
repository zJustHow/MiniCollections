import Constants from "expo-constants";
import { normalizePublicUrl } from "../../expoPublicUrl";

type AppExtra = {
  webUrl?: unknown;
};

function readConfiguredWebUrl(): string | undefined {
  const fromEnv = normalizePublicUrl(process.env.EXPO_PUBLIC_WEB_URL);
  if (fromEnv) return fromEnv;

  const fromExtra = normalizePublicUrl(
    (Constants.expoConfig?.extra as AppExtra | undefined)?.webUrl,
  );
  if (fromExtra) return fromExtra;

  return undefined;
}

/** Public web origin for Universal Links, e.g. https://app.example.com */
export const WEB_BASE_URL = readConfiguredWebUrl();

export function buildAppLink(path: string): string {
  const normalized = path.replace(/^\//, "");
  if (WEB_BASE_URL) {
    return `${WEB_BASE_URL}/${normalized}`;
  }
  return `minicollections://${normalized}`;
}

export function linkPrefixes(): string[] {
  const prefixes = ["minicollections://"];
  if (WEB_BASE_URL) {
    prefixes.push(WEB_BASE_URL);
  }
  return prefixes;
}

export function webLinkHost(): string | null {
  if (!WEB_BASE_URL) return null;
  try {
    return new URL(WEB_BASE_URL).hostname;
  } catch {
    return null;
  }
}
