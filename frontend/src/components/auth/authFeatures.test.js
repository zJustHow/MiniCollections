import { PHONE_AUTH_ENABLED, WECHAT_AUTH_ENABLED } from "./authFeatures";

describe("authFeatures", () => {
  test("phone auth flag is defined", () => {
    expect(typeof PHONE_AUTH_ENABLED).toBe("boolean");
  });

  test("wechat auth flag is defined", () => {
    expect(typeof WECHAT_AUTH_ENABLED).toBe("boolean");
  });
});
