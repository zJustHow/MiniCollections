import {
  prefetchProfilePage,
  prefetchRegisterPage,
  prefetchForgotPasswordPage,
  prefetchLoginPage,
  prefetchAuthPages,
  prefetchBrandObjectDetailPage,
  prefetchGroupObjectDetailPage,
  prefetchBrandObjectsPage,
  prefetchGroupObjectsPage,
} from "./prefetchRoutes";

describe("prefetchProfilePage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchProfilePage();
    const second = prefetchProfilePage();
    expect(first).toBe(second);
    await first;
  });
});

describe("prefetchRegisterPage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchRegisterPage();
    const second = prefetchRegisterPage();
    expect(first).toBe(second);
    await first;
  });
});

describe("prefetchForgotPasswordPage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchForgotPasswordPage();
    const second = prefetchForgotPasswordPage();
    expect(first).toBe(second);
    await first;
  });
});

describe("prefetchLoginPage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchLoginPage();
    const second = prefetchLoginPage();
    expect(first).toBe(second);
    await first;
  });
});

describe("prefetchAuthPages", () => {
  test("prefetches register and forgot password pages", async () => {
    prefetchAuthPages();
    await Promise.all([prefetchRegisterPage(), prefetchForgotPasswordPage()]);
  });
});

describe("prefetchBrandObjectDetailPage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchBrandObjectDetailPage();
    const second = prefetchBrandObjectDetailPage();
    expect(first).toBe(second);
    await first;
  });
});

describe("prefetchGroupObjectDetailPage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchGroupObjectDetailPage();
    const second = prefetchGroupObjectDetailPage();
    expect(first).toBe(second);
    await first;
  });
});

describe("prefetchBrandObjectsPage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchBrandObjectsPage();
    const second = prefetchBrandObjectsPage();
    expect(first).toBe(second);
    await first;
  });
});

describe("prefetchGroupObjectsPage", () => {
  test("returns the same in-flight import promise", async () => {
    const first = prefetchGroupObjectsPage();
    const second = prefetchGroupObjectsPage();
    expect(first).toBe(second);
    await first;
  });
});
