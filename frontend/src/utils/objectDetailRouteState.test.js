import { hydrateBrandObjectFromRouteState } from "./objectDetailRouteState";

describe("hydrateBrandObjectFromRouteState", () => {
  test("merges brand from separate navigation state", () => {
    expect(
      hydrateBrandObjectFromRouteState(
        {
          brandObject: { id: 1, name: "M3" },
          brand: { name_en: "BMW", name_zh: "宝马" },
        },
        "en-US",
      ),
    ).toEqual({ id: 1, name: "M3", brand: "BMW" });
  });

  test("uses brand_name fields on the object when present", () => {
    expect(
      hydrateBrandObjectFromRouteState(
        {
          brandObject: {
            id: 1,
            name: "M3",
            brand_name_en: "BMW",
            brand_name_zh: "宝马",
          },
        },
        "zh-CN",
      ),
    ).toEqual({
      id: 1,
      name: "M3",
      brand_name_en: "BMW",
      brand_name_zh: "宝马",
      brand: "宝马",
    });
  });

  test("returns null when route state has no object", () => {
    expect(hydrateBrandObjectFromRouteState(null, "en-US")).toBeNull();
  });
});
