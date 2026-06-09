import { prefetchProfilePage } from "./prefetchRoutes";

describe("prefetchProfilePage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchProfilePage();
    const second = prefetchProfilePage();
    expect(first).toBe(second);
    await first;
  });
});
