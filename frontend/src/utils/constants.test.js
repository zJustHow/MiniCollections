import { parsePhone, resolveMediaUrl } from "./constants";

describe("resolveMediaUrl", () => {
  test("appends cache-bust query for minio media urls", () => {
    expect(resolveMediaUrl("http://localhost:9000/minicollections-media/foo.png"))
      .toBe("http://localhost:9000/minicollections-media/foo.png?v=2");
  });

  test("leaves other urls unchanged", () => {
    const url = "https://example.com/logo.png";
    expect(resolveMediaUrl(url)).toBe(url);
  });

  test("does not double-append version param", () => {
    const url = "http://localhost:9000/minicollections-media/foo.png?v=3";
    expect(resolveMediaUrl(url)).toBe(url);
  });
});

describe("parsePhone", () => {
  test("returns default for empty input", () => {
    expect(parsePhone()).toEqual({ countryCode: "+86", phoneNumber: "" });
  });

  test("splits known country codes longest-first", () => {
    expect(parsePhone("+85291234567")).toEqual({
      countryCode: "+852",
      phoneNumber: "91234567",
    });
  });
});
