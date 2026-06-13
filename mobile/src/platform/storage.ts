import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "@minicollections/api";

let tokenCache: string | null = null;
let hydrated = false;

export async function hydrateTokenStorage() {
  if (hydrated) return;
  tokenCache = await SecureStore.getItemAsync(TOKEN_KEY);
  hydrated = true;
}

export const mobileTokenStorage = {
  getToken(): string | null {
    return tokenCache;
  },
  setToken(token: string) {
    tokenCache = token;
    void SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  removeToken() {
    tokenCache = null;
    void SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

export type PlatformServices = {
  storage: typeof mobileTokenStorage;
};

export const platformServices: PlatformServices = {
  storage: mobileTokenStorage,
};
