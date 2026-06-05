import { createContext, useCallback, useContext, useState } from "react";
import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { detectBrowserLocale, translations, translateError } from "./i18n";
import { neuFormControlTheme } from "./components/NeuFormControl";
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
        wave={{ disabled: true }}
        theme={{
          token: {
            ...neuFormControlTheme.token,
            fontFamily:         '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            colorPrimary:       "#5592cc",
            colorPrimaryHover:  "#6aa8dc",
            colorPrimaryActive: "#6aa8dc",
            colorSuccess:       "#00BF9A",
            colorWarning:       "#F5B759",
            colorError:         "#FA5252",
            colorInfo:          "#1E90FF",
            colorText:          "#44476A",
            colorTextSecondary: "#66799e",
            colorBgContainer:   "#fcfbf8",
            colorBgElevated:    "#fcfbf8",
            colorBgLayout:      "#fcfbf8",
            fontWeightStrong:   400,
            borderRadius:       RADIUS_PX.md,
            borderRadiusSM:     RADIUS_PX.md,
            borderRadiusLG:     RADIUS_PX.lg,
            borderRadiusXS:     RADIUS_PX.sm,
          },
          components: {
            Button: {
              colorPrimary:        "#5592cc",
              colorPrimaryHover:   "#6aa8dc",
              colorPrimaryActive:  "#6aa8dc",
              primaryColor:        "#fff",
              defaultColor:        "#44476A",
              defaultHoverColor:   "#5592cc",
              defaultActiveColor:  "#66799e",
              defaultBorderColor:      "#fcfbf8",
              defaultHoverBorderColor: "#fcfbf8",
              defaultActiveBorderColor:"#fcfbf8",
              colorError:          "#FA5252",
              colorErrorHover:     "#fb6b6b",
              colorErrorActive:    "#fb6b6b",
              dangerColor:         "#fff",
              fontWeight:          400,
            },
            ...neuFormControlTheme.components,
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
