import { mutateSearchParams, readSearchParams } from "./searchParams";

describe("searchParams helpers", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/brands?categoryIds=1&q=bmw");
  });

  test("readSearchParams reflects current browser URL", () => {
    const params = readSearchParams();
    expect(params.get("q")).toBe("bmw");
    expect(params.getAll("categoryIds")).toEqual(["1"]);
  });

  test("mutateSearchParams reads live URL instead of stale snapshot", () => {
    const setSearchParams = vi.fn((updater, options) => {
      if (typeof updater === "function") {
        updater(new URLSearchParams("stale=1"));
      }
    });

    mutateSearchParams(setSearchParams, (next) => {
      expect(next.get("q")).toBe("bmw");
      next.set("scaleIds", "64");
    });

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(Function), undefined);
    const updater = setSearchParams.mock.calls[0][0];
    const result = updater(new URLSearchParams("ignored=1"));
    expect(result.get("q")).toBe("bmw");
    expect(result.get("scaleIds")).toBe("64");
  });
});
