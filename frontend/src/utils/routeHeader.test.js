import { resolveRouteHeader } from "./routeHeader";

describe("resolveRouteHeader", () => {
  it("returns null for routes outside brand/group lists", () => {
    expect(
      resolveRouteHeader({
        location: { pathname: "/", state: null },
        isAdmin: false,
      }),
    ).toBeNull();

    expect(
      resolveRouteHeader({
        location: {
          pathname: "/brands/3/objects/9",
          state: { brandObject: { name: "Model X" } },
        },
        isAdmin: false,
      }),
    ).toBeNull();
  });

  it("uses navigation state for brand list routes", () => {
    const brand = { id: 3, name: "Acme" };
    const header = resolveRouteHeader({
      location: {
        pathname: "/brands/3",
        state: { brand, returnSearch: "?page=2" },
      },
      isAdmin: false,
    });
    expect(header.props.brand).toEqual(brand);
    expect(header.props.returnSearch).toBe("?page=2");
  });

  it("uses navigation state for group list routes", () => {
    const header = resolveRouteHeader({
      location: {
        pathname: "/groups/2",
        state: { group: { id: 2, name: "My group" }, returnSearch: "?q=test" },
      },
      isAdmin: false,
    });
    expect(header.props.group).toEqual({ id: 2, name: "My group" });
    expect(header.props.returnSearch).toBe("?q=test");
  });
});
