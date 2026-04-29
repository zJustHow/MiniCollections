import { createContext, useCallback, useContext, useState } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";
import { detectBrowserLocale, translations } from "./i18n";

const antdLocaleMap = { "zh-CN": zhCN, "en-US": enUS };

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
      <ConfigProvider locale={antdLocaleMap[locale] ?? enUS}>
        {children}
      </ConfigProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
