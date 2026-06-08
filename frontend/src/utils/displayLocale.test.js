import { pickBrandName, pickLocalizedField } from "./displayLocale";

describe("displayLocale helpers", () => {
  test("pickLocalizedField prefers zh when locale is zh-CN", () => {
    const record = { name_en: "English", name_zh: "中文" };
    expect(pickLocalizedField(record, { enKey: "name_en", zhKey: "name_zh" }, "zh-CN"))
      .toBe("中文");
    expect(pickLocalizedField(record, { enKey: "name_en", zhKey: "name_zh" }, "en-US"))
      .toBe("English");
  });

  test("pickLocalizedField falls back across locales", () => {
    const record = { name_en: "English" };
    expect(pickLocalizedField(record, { enKey: "name_en", zhKey: "name_zh" }, "zh-CN"))
      .toBe("English");
  });

  test("pickLocalizedField uses singleKey when provided", () => {
    const record = { label: "Unified" };
    expect(
      pickLocalizedField(record, { enKey: "name_en", zhKey: "name_zh", singleKey: "label" }, "en-US"),
    ).toBe("Unified");
  });

  test("pickBrandName reads brand fields", () => {
    expect(
      pickBrandName({ brand_name_en: "Kyosho", brand_name_zh: "京商" }, "zh-CN"),
    ).toBe("京商");
    expect(pickBrandName({ brand: "Mini GT" }, "en-US")).toBe("Mini GT");
  });
});
