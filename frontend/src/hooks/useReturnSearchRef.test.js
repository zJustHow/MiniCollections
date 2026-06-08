import { renderHook } from "@testing-library/react";
import useReturnSearchRef from "./useReturnSearchRef";

describe("useReturnSearchRef", () => {
  test("returns initial returnSearch value", () => {
    const { result } = renderHook(() => useReturnSearchRef("?q=bmw"));

    expect(result.current.current).toBe("?q=bmw");
  });

  test("updates ref when returnSearch changes", () => {
    const { result, rerender } = renderHook(
      ({ returnSearch }) => useReturnSearchRef(returnSearch),
      { initialProps: { returnSearch: "?q=bmw" } },
    );

    rerender({ returnSearch: "?q=m3" });

    expect(result.current.current).toBe("?q=m3");
  });

  test("keeps previous value when returnSearch becomes null", () => {
    const { result, rerender } = renderHook(
      ({ returnSearch }) => useReturnSearchRef(returnSearch),
      { initialProps: { returnSearch: "?q=bmw" } },
    );

    rerender({ returnSearch: null });

    expect(result.current.current).toBe("?q=bmw");
  });
});
