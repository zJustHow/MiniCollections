import { act, renderHook } from "@testing-library/react";
import useCountdown from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("counts down and clears on unmount", () => {
    const { result, unmount } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(2);
    });
    expect(result.current.countdown).toBe(2);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
  });

  test("reset stops countdown", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(5);
      result.current.reset();
    });

    expect(result.current.countdown).toBe(0);
  });
});
