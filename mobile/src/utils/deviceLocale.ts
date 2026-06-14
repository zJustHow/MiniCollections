export type AppLocale = "en-US" | "zh-CN";

export function resolveDeviceLocale(): AppLocale {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale ?? "";
    if (tag.toLowerCase().startsWith("zh")) return "zh-CN";
  } catch {
    // fall through
  }
  return "en-US";
}
