import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { configureApi, login as apiLogin, logout as apiLogout, getMe } from "@minicollections/api";
import { hydrateTokenStorage, mobileTokenStorage } from "../platform";
import { API_BASE_URL } from "../config";

export type UserProfile = {
  id?: number;
  display_name?: string;
  email?: string;
  phone?: string | null;
  is_admin?: boolean;
  admin?: boolean;
  preferred_locale?: string;
  avatar_url?: string;
  wechat_bound?: boolean;
  password_set?: boolean;
};

type AuthContextValue = {
  authed: boolean;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (params: {
    identifier: string;
    password: string;
    loginType: "email" | "phone";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await hydrateTokenStorage();
      configureApi({
        baseUrl: API_BASE_URL,
        storage: mobileTokenStorage,
      });

      try {
        const me = await getMe();
        if (!cancelled) setProfile(me);
      } catch {
        mobileTokenStorage.removeToken();
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const me = await getMe();
    setProfile(me);
  }, []);

  const login = useCallback(
    async (params: {
      identifier: string;
      password: string;
      loginType: "email" | "phone";
    }) => {
      await apiLogin(params);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const logout = useCallback(async () => {
    apiLogout();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      authed: profile != null,
      profile,
      isAdmin: Boolean(profile?.is_admin ?? profile?.admin),
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [profile, loading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
