import {
  resolveHeaderSkeletonEndActions,
  resolveRouteSkeletonVariant,
  usesCustomHeader,
  usesMainLayout,
} from "./routeSkeleton";

describe("usesMainLayout", () => {
  it("returns false for standalone auth routes", () => {
    expect(usesMainLayout("/login")).toBe(false);
    expect(usesMainLayout("/register")).toBe(false);
    expect(usesMainLayout("/forgot-password")).toBe(false);
    expect(usesMainLayout("/wechat-callback")).toBe(false);
  });

  it("returns true for main app routes", () => {
    expect(usesMainLayout("/")).toBe(true);
    expect(usesMainLayout("/groups")).toBe(true);
    expect(usesMainLayout("/feedback")).toBe(true);
    expect(usesMainLayout("/admin/brands/1")).toBe(true);
  });
});

describe("usesCustomHeader", () => {
  it("returns true for routes that inject a custom header", () => {
    expect(usesCustomHeader("/profile")).toBe(true);
    expect(usesCustomHeader("/brands/3")).toBe(true);
    expect(usesCustomHeader("/brands/3/objects/9")).toBe(true);
    expect(usesCustomHeader("/groups/2")).toBe(true);
    expect(usesCustomHeader("/groups/2/objects/7")).toBe(true);
    expect(usesCustomHeader("/admin/brands")).toBe(true);
    expect(usesCustomHeader("/admin/brands/12")).toBe(true);
    expect(usesCustomHeader("/admin/categories")).toBe(true);
    expect(usesCustomHeader("/admin/scales")).toBe(true);
  });

  it("returns false for default nav routes", () => {
    expect(usesCustomHeader("/")).toBe(false);
    expect(usesCustomHeader("/groups")).toBe(false);
    expect(usesCustomHeader("/feedback")).toBe(false);
    expect(usesCustomHeader("/admin")).toBe(false);
  });
});

describe("resolveHeaderSkeletonEndActions", () => {
  it("maps routes to the expected action button count", () => {
    expect(resolveHeaderSkeletonEndActions("/profile")).toBe(1);
    expect(resolveHeaderSkeletonEndActions("/admin/brands")).toBe(1);
    expect(resolveHeaderSkeletonEndActions("/admin/brands/12")).toBe(1);
    expect(resolveHeaderSkeletonEndActions("/admin/categories")).toBe(1);
    expect(resolveHeaderSkeletonEndActions("/admin/scales")).toBe(1);
    expect(resolveHeaderSkeletonEndActions("/groups/2")).toBe(2);
    expect(resolveHeaderSkeletonEndActions("/groups/2/objects/7")).toBe(2);
    expect(resolveHeaderSkeletonEndActions("/brands/3")).toBe(0);
    expect(resolveHeaderSkeletonEndActions("/brands/3/objects/9")).toBe(0);
    expect(resolveHeaderSkeletonEndActions("/brands/3", { isAdmin: true })).toBe(
      2,
    );
    expect(
      resolveHeaderSkeletonEndActions("/brands/3/objects/9", { isAdmin: true }),
    ).toBe(2);
  });
});

describe("resolveRouteSkeletonVariant", () => {
  it("maps routes to skeleton variants", () => {
    expect(resolveRouteSkeletonVariant("/")).toBe("brands");
    expect(resolveRouteSkeletonVariant("/groups")).toBe("groups");
    expect(resolveRouteSkeletonVariant("/profile")).toBe("profile");
    expect(resolveRouteSkeletonVariant("/feedback")).toBe("feedback");
    expect(resolveRouteSkeletonVariant("/admin")).toBe("admin");
    expect(resolveRouteSkeletonVariant("/admin/brands")).toBe("admin");
    expect(resolveRouteSkeletonVariant("/admin/brands/12")).toBe("admin");
    expect(resolveRouteSkeletonVariant("/admin/categories")).toBe("admin");
    expect(resolveRouteSkeletonVariant("/admin/scales")).toBe("admin");
    expect(resolveRouteSkeletonVariant("/brands/3")).toBe("brandObjects");
    expect(resolveRouteSkeletonVariant("/brands/3/objects/9")).toBe(
      "brandObjectDetail",
    );
    expect(resolveRouteSkeletonVariant("/groups/2")).toBe("groupObjects");
    expect(resolveRouteSkeletonVariant("/groups/2/objects/7")).toBe(
      "groupObjectDetail",
    );
    expect(resolveRouteSkeletonVariant("/register")).toBe("register");
    expect(resolveRouteSkeletonVariant("/forgot-password")).toBe(
      "forgotPassword",
    );
    expect(resolveRouteSkeletonVariant("/wechat-callback")).toBe(
      "wechatCallback",
    );
    expect(resolveRouteSkeletonVariant("/login")).toBe("brands");
  });
});
