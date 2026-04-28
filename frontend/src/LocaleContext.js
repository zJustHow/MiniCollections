import { createContext, useCallback, useContext, useState } from "react";
import { detectBrowserLocale, translations } from "./i18n";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(detectBrowserLocale);

  const t = useCallback(
    (key, params) => {
      const dict = translations[locale] ?? translations["en-US"];
      const str = dict[key] ?? translations["en-US"][key] ?? key;
      if (!params) return str;
      return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ""));
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
