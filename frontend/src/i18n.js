import en from "./i18n/en";

export const translations = { "en-US": en };

export async function ensureLocaleLoaded(locale) {
  if (locale !== "zh-CN" || translations["zh-CN"]) return;
  const mod = await import("./i18n/zh");
  translations["zh-CN"] = mod.default;
}

export function translateError(code, args, locale = "en-US") {
  const dict = translations[locale] ?? translations["en-US"];
  let str = dict[code] ?? translations["en-US"][code] ?? code;
  if (args?.length) {
    str = str.replace(/\{(\d+)\}/g, (_, i) => String(args[Number(i)] ?? ""));
  }
  return str;
}

export function detectBrowserLocale() {
  const lang = navigator.language || "en-US";
  return lang.startsWith("zh") ? "zh-CN" : "en-US";
}
