import { renderHook, act } from "@testing-library/react";
import { HeaderProvider, useHeader } from "./HeaderContext";

describe("HeaderContext", () => {
  test("setHeaderSlot updates headerSlot", () => {
    const { result } = renderHook(() => useHeader(), {
      wrapper: HeaderProvider,
    });

    expect(result.current.headerSlot).toBeNull();

    act(() => {
      result.current.setHeaderSlot(<span>Back</span>);
    });

    expect(result.current.headerSlot).not.toBeNull();
  });

  test("setHeaderSlot keeps stable callback identity", () => {
    const { result, rerender } = renderHook(() => useHeader(), {
      wrapper: HeaderProvider,
    });

    const firstSetter = result.current.setHeaderSlot;
    rerender();
    expect(result.current.setHeaderSlot).toBe(firstSetter);
  });
});
