import { createContext, useCallback, useContext, useState } from "react";
import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { detectBrowserLocale, translations, translateError } from "./i18n";
import { RADIUS_PX } from "./theme/radius";
import { setCurrentLocale } from "./utils";

const antdLocaleMap = { "zh-CN": zhCN, "en-US": enUS };

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const initial = detectBrowserLocale();
    setCurrentLocale(initial);
    return initial;
  });

  const t = useCallback(
    (key, params) => {
      if (Array.isArray(params)) {
        return translateError(key, params, locale);
      }
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
            fontFamily:         '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            colorPrimary:       "#5592cc",
            colorPrimaryHover:  "#6aa8dc",
            colorPrimaryActive: "#3d78b8",
            colorSuccess:       "#00BF9A",
            colorWarning:       "#F5B759",
            colorError:         "#FA5252",
            colorInfo:          "#1E90FF",
            colorText:          "#44476A",
            colorTextSecondary: "#66799e",
            colorBgContainer:   "#fcfbf8",
            colorBgElevated:    "#fcfbf8",
            colorBgLayout:      "#fcfbf8",
            borderRadius:       RADIUS_PX.md,
            borderRadiusSM:     RADIUS_PX.md,
            borderRadiusLG:     RADIUS_PX.lg,
            borderRadiusXS:     RADIUS_PX.sm,
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
