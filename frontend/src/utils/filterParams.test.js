import {
  appendIdListParams,
  filterKeyFromIds,
  toggleInList,
} from "./filterParams";

describe("filterParams", () => {
  test("toggleInList adds and removes ids", () => {
    expect(toggleInList(1, [])).toEqual([1]);
    expect(toggleInList(1, [1, 2])).toEqual([2]);
  });

  test("appendIdListParams appends string ids", () => {
    const params = new URLSearchParams();
    appendIdListParams(params, "categoryIds", [1, 2]);
    expect(params.getAll("categoryIds")).toEqual(["1", "2"]);
    appendIdListParams(params, "brandIds", []);
    expect(params.getAll("brandIds")).toEqual([]);
  });

  test("filterKeyFromIds builds stable keys", () => {
    expect(filterKeyFromIds([1], [2], [3], [4])).toBe("1:2:3:4");
    expect(filterKeyFromIds([], [], [], [])).toBe("c:b:s:r");
  });
});
