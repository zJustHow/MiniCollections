import { act, renderHook } from "@testing-library/react";
import useDraftSearchQuery from "./useDraftSearchQuery";
import useTabListSearchField from "./useTabListSearchField";

describe("useDraftSearchQuery", () => {
  test("syncs draft when searchValue changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDraftSearchQuery(value),
      { initialProps: { value: "bmw" } },
    );

    expect(result.current[0]).toBe("bmw");

    rerender({ value: "mini" });
    expect(result.current[0]).toBe("mini");
  });
});

describe("useTabListSearchField", () => {
  test("clears search when draft becomes empty", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useTabListSearchField("bmw", onSearch));

    act(() => {
      result.current.handleDraftChange("");
    });

    expect(onSearch).toHaveBeenCalledWith("");
  });
});
