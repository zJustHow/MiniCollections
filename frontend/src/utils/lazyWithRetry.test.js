import { isChunkLoadError, lazyWithRetry } from "./lazyWithRetry";

describe("lazyWithRetry", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("isChunkLoadError detects chunk failures", () => {
    expect(isChunkLoadError({ name: "ChunkLoadError", message: "x" })).toBe(true);
    expect(isChunkLoadError(new Error("Loading chunk 9 failed"))).toBe(true);
    expect(isChunkLoadError(new Error("Failed to fetch dynamically imported module"))).toBe(true);
    expect(isChunkLoadError(new Error("network down"))).toBe(false);
  });

  test("lazyWithRetry returns a lazy component", () => {
    const importFn = vi.fn(async () => ({ default: () => null }));
    const Lazy = lazyWithRetry(importFn, "test-load");
    expect(Lazy).toBeTruthy();
    expect(typeof Lazy).toBe("object");
  });

  test("lazyWithRetry reloads once on chunk load error when rendered", async () => {
    const chunkError = Object.assign(new Error("Loading chunk 9 failed"), {
      name: "ChunkLoadError",
    });
    const importFn = vi
      .fn()
      .mockRejectedValueOnce(chunkError)
      .mockResolvedValueOnce({ default: () => null });

    const reload = vi.fn();
    vi.stubGlobal("location", { reload });

    const { lazyWithRetry: lazyWithRetryFn } = await import("./lazyWithRetry");
    const Lazy = lazyWithRetryFn(importFn, "render-retry");

    const { Suspense } = await import("react");
    const { render } = await import("@testing-library/react");

    render(
      <Suspense fallback={null}>
        <Lazy />
      </Suspense>,
    );

    await vi.waitFor(() => {
      expect(reload).toHaveBeenCalledTimes(1);
    });
    expect(sessionStorage.getItem(`render-retry:${importFn.toString()}`)).toBe("1");
  });
});
