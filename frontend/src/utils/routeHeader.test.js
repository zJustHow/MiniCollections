import { resolveRouteHeader } from "./routeHeader";

const t = (key) => key;
const navigate = vi.fn();
const onLogout = vi.fn();

describe("resolveRouteHeader", () => {
  it("returns null for default nav routes", () => {
    expect(
      resolveRouteHeader({
        location: { pathname: "/", state: null },
        navigate,
        t,
        isAdmin: false,
        onLogout,
      }),
    ).toBeNull();
  });

  it("builds profile header", () => {
    const header = resolveRouteHeader({
      location: { pathname: "/profile", state: null },
      navigate,
      t,
      isAdmin: false,
      onLogout,
    });
    expect(header).not.toBeNull();
    expect(header.props.title).toBe("profileTitle");
  });

  it("uses navigation state for brand and group list routes", () => {
    const brand = { id: 3, name: "Acme" };
    const brandHeader = resolveRouteHeader({
      location: {
        pathname: "/brands/3",
        state: { brand, returnSearch: "?page=2" },
      },
      navigate,
      t,
      isAdmin: false,
      onLogout,
    });
    expect(brandHeader.props.brand).toEqual(brand);
    expect(brandHeader.props.returnSearch).toBe("?page=2");

    const groupHeader = resolveRouteHeader({
      location: {
        pathname: "/groups/2",
        state: { group: { id: 2, name: "My group" }, returnSearch: "?q=test" },
      },
      navigate,
      t,
      isAdmin: false,
      onLogout,
    });
    expect(groupHeader.props.group).toEqual({ id: 2, name: "My group" });
    expect(groupHeader.props.returnSearch).toBe("?q=test");
  });

  it("returns null for object detail routes so pages own their header", () => {
    expect(
      resolveRouteHeader({
        location: {
          pathname: "/brands/3/objects/9",
          state: { brandObject: { name: "Model X" } },
        },
        navigate,
        t,
        isAdmin: false,
        onLogout,
      }),
    ).toBeNull();

    expect(
      resolveRouteHeader({
        location: {
          pathname: "/groups/2/objects/5",
          state: { userObject: { name: "My model" } },
        },
        navigate,
        t,
        isAdmin: false,
        onLogout,
      }),
    ).toBeNull();
  });

  it("builds admin catalog headers", () => {
    expect(
      resolveRouteHeader({
        location: { pathname: "/admin/brands", state: null },
        navigate,
        t,
        isAdmin: true,
        onLogout,
      }).props.brandName,
    ).toBe("brands");

    expect(
      resolveRouteHeader({
        location: { pathname: "/admin/categories", state: null },
        navigate,
        t,
        isAdmin: true,
        onLogout,
      }).props.brandName,
    ).toBe("categories");
  });
});
