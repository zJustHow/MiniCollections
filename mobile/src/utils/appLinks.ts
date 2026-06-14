import Constants from "expo-constants";

type AppExtra = {
  webUrl?: string | null;
};

function readConfiguredWebUrl(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const fromExtra = (Constants.expoConfig?.extra as AppExtra | undefined)?.webUrl?.trim();
  if (fromExtra) return fromExtra.replace(/\/$/, "");

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
