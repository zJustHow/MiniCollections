import {
  hasRealListItems,
  shouldShowNoData,
  withAddCardSlot,
} from "./listPageUtils";

describe("listPageUtils", () => {
  test("withAddCardSlot prepends add card when enabled", () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(withAddCardSlot(items, true)).toEqual([{ id: "__add__" }, ...items]);
    expect(withAddCardSlot(items, false)).toEqual(items);
  });

  test("hasRealListItems ignores add-card slot", () => {
    expect(hasRealListItems([{ id: "__add__" }])).toBe(false);
    expect(hasRealListItems([{ id: "__add__" }, { id: 1 }])).toBe(true);
  });

  test("shouldShowNoData respects loading and add-card slot", () => {
    expect(shouldShowNoData([], { loading: true })).toBe(false);
    expect(shouldShowNoData([], { loading: false })).toBe(true);
    expect(shouldShowNoData([{ id: "__add__" }], { loading: false })).toBe(
      false,
    );
    expect(
      shouldShowNoData([{ id: "__add__" }, { id: 1 }], { loading: false }),
    ).toBe(false);
  });
});
