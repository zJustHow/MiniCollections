import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("delays invocation until waitMs elapses", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced("a");
    debounced("b");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
  });

  test("cancel prevents pending call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("x");
    debounced.cancel();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });
});
