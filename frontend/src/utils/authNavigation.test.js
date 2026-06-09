import { getAuthNavigationLoaderVariant } from "./authNavigation";

describe("getAuthNavigationLoaderVariant", () => {
  test("returns null when navigation is idle", () => {
    expect(
      getAuthNavigationLoaderVariant({ state: "idle", location: { pathname: "/register" } }),
    ).toBeNull();
  });

  test("returns loader variant for auth routes while loading", () => {
    expect(
      getAuthNavigationLoaderVariant({
        state: "loading",
        location: { pathname: "/register" },
      }),
    ).toBe("register");
    expect(
      getAuthNavigationLoaderVariant({
        state: "loading",
        location: { pathname: "/forgot-password" },
      }),
    ).toBe("forgotPassword");
    expect(
      getAuthNavigationLoaderVariant({
        state: "loading",
        location: { pathname: "/login" },
      }),
    ).toBe("splash");
  });

  test("returns null for unknown loading destinations", () => {
    expect(
      getAuthNavigationLoaderVariant({
        state: "loading",
        location: { pathname: "/profile" },
      }),
    ).toBeNull();
  });
});
