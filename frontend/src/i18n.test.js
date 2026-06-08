import en from "./i18n/en";
import zh from "./i18n/zh";
import {
  detectBrowserLocale,
  ensureLocaleLoaded,
  translateError,
  translations,
} from "./i18n";

describe("i18n", () => {
  test("translateError substitutes positional args", () => {
    expect(translateError("error.submission.limit", [5], "en-US")).toBe(
      "Submission limit reached: maximum 5 submissions per day",
    );
    expect(translateError("error.submission.limit", [3], "zh-CN")).toContain("3");
  });

  test("translateError falls back to code when missing", () => {
    expect(translateError("error.unknown_code", null, "en-US")).toBe(
      "error.unknown_code",
    );
  });

  test("detectBrowserLocale maps zh variants to zh-CN", () => {
    vi.stubGlobal("navigator", { language: "zh-HK" });
    expect(detectBrowserLocale()).toBe("zh-CN");

    vi.stubGlobal("navigator", { language: "en-GB" });
    expect(detectBrowserLocale()).toBe("en-US");
  });

  test("ensureLocaleLoaded lazy-loads zh dictionary", async () => {
    delete translations["zh-CN"];
    await ensureLocaleLoaded("zh-CN");
    expect(translations["zh-CN"]).toBeTruthy();
    expect(translations["zh-CN"].brands).toBe("品牌");
  });

  test("en and zh dictionaries share the same keys", () => {
    const enKeys = Object.keys(en).sort();
    const zhKeys = Object.keys(zh).sort();
    expect(zhKeys).toEqual(enKeys);
  });
});
