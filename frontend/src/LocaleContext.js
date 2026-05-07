import { createContext, useCallback, useContext, useState } from "react";
import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
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
      <ConfigProvider
        locale={antdLocaleMap[locale] ?? enUS}
        theme={{
          token: {
            colorBgContainer: "#fcfbf8",
            colorBgElevated:  "#fcfbf8",
            colorBgLayout:    "#fcfbf8",
            borderRadius:     10,
            borderRadiusSM:   10,
            borderRadiusLG:   14,
            borderRadiusXS:   6,
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
