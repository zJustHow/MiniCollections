import { describe, expect, test } from "vitest";
import {
  getBrowseChunkDataLimit,
  getNextBrowseUiPage,
  sortItemsByOrderedIds,
} from "./infiniteBrowse";

describe("infiniteBrowse", () => {
  test("getNextBrowseUiPage advances through add-card-aware pages", () => {
    expect(getNextBrowseUiPage(0, 48, 1)).toBe(0);
    expect(getNextBrowseUiPage(47, 48, 1)).toBe(1);
    expect(getNextBrowseUiPage(95, 48, 1)).toBe(2);
  });

  test("getBrowseChunkDataLimit respects reserved first-page slots", () => {
    expect(getBrowseChunkDataLimit(0, 48, 1)).toBe(47);
    expect(getBrowseChunkDataLimit(1, 48, 1)).toBe(48);
  });

  test("sortItemsByOrderedIds reorders loaded items", () => {
    const items = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" },
    ];
    expect(sortItemsByOrderedIds(items, [3, 1, 2]).map((item) => item.id)).toEqual([
      3, 1, 2,
    ]);
  });

  test("sortItemsByOrderedIds returns original items when order is empty", () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(sortItemsByOrderedIds(items, [])).toEqual(items);
    expect(sortItemsByOrderedIds(items, null)).toEqual(items);
  });
});
