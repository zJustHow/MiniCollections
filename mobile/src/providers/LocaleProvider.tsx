import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ensureLocaleLoaded, translate, translateError } from "@minicollections/i18n";
import { setCurrentLocale } from "@minicollections/api";
import type { AppLocale } from "../utils/deviceLocale";

type Locale = AppLocale;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  te: (code: string, args?: unknown[]) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = "en-US",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setCurrentLocale(initialLocale);
    void ensureLocaleLoaded(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setCurrentLocale(next);
    void ensureLocaleLoaded(next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(key, locale, params),
    [locale],
  );

  const te = useCallback(
    (code: string, args?: unknown[]) =>
      translateError(code, args as never[], locale),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, te }),
    [locale, setLocale, t, te],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
