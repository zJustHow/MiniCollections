import {
  displayPurchasePriceFromObject,
  formatReleasePrice,
  formatViewCount,
  purchasePriceFromFormValue,
} from "./format";

const t = (key, args) => {
  if (key === "viewsCount") return `${args.count} views`;
  if (key === "viewsCountThousand") return `${args.count}K views`;
  if (key === "viewsCountMillion") return `${args.count}M views`;
  return key;
};

describe("format helpers", () => {
  test("formatViewCount scales large numbers", () => {
    expect(formatViewCount(0, t)).toBeNull();
    expect(formatViewCount(42, t)).toBe("42 views");
    expect(formatViewCount(1500, t)).toBe("1.5K views");
    expect(formatViewCount(2_500_000, t)).toBe("2.5M views");
  });

  test("purchasePriceFromFormValue normalizes input", () => {
    expect(purchasePriceFromFormValue("")).toEqual({ purchase_price: null });
    expect(purchasePriceFromFormValue("12.5")).toEqual({ purchase_price: 12.5 });
    expect(purchasePriceFromFormValue("abc")).toEqual({ purchase_price: null });
  });

  test("displayPurchasePriceFromObject reads snake or camel case", () => {
    expect(displayPurchasePriceFromObject({ purchase_price: 9 })).toBe(9);
    expect(displayPurchasePriceFromObject({ purchasePrice: 11 })).toBe(11);
  });

  test("formatReleasePrice joins available currencies", () => {
    expect(formatReleasePrice({ release_price_cny: 99, release_price_usd: 15 }))
      .toBe("¥99 / $15");
    expect(formatReleasePrice({})).toBeNull();
  });
});
