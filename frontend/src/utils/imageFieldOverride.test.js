import {
  resolveImageFieldDisplay,
  resolveImageFieldPayload,
} from "./imageFieldOverride";

describe("resolveImageFieldDisplay", () => {
  it("uses default when override is undefined", () => {
    expect(resolveImageFieldDisplay(undefined, "brand.png")).toBe("brand.png");
  });

  it("shows null when override is explicitly cleared", () => {
    expect(resolveImageFieldDisplay(null, "brand.png")).toBeNull();
  });

  it("uses override URL when set", () => {
    expect(resolveImageFieldDisplay("custom.png", "brand.png")).toBe(
      "custom.png",
    );
  });
});

describe("resolveImageFieldPayload", () => {
  it("keeps fallbacks when override is undefined", () => {
    expect(resolveImageFieldPayload(undefined, null, "brand.png")).toBe(
      "brand.png",
    );
  });

  it("sends null when override is explicitly cleared", () => {
    expect(resolveImageFieldPayload(null, "brand.png")).toBeNull();
  });

  it("sends override URL when set", () => {
    expect(resolveImageFieldPayload("custom.png", "brand.png")).toBe(
      "custom.png",
    );
  });
});
