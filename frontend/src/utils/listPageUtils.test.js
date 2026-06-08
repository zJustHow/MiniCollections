import { withAddCardSlot } from "./listPageUtils";

describe("listPageUtils", () => {
  test("withAddCardSlot prepends add card when enabled", () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(withAddCardSlot(items, true)).toEqual([{ id: "__add__" }, ...items]);
    expect(withAddCardSlot(items, false)).toEqual(items);
  });
});
