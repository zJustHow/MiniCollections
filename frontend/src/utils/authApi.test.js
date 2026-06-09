import {
  bindWechatAccount,
  exchangeWechatCode,
  getWechatAuthUrl,
  login,
  logout,
  resetPassword,
  sendCode,
  sendForgotPasswordCode,
  signup,
} from "./authApi";
import { TOKEN_KEY } from "./apiClient";

describe("authApi", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ token: "jwt-token" }),
    }));
  });

  test("login stores token for email login", async () => {
    await login({ identifier: "alice@example.com", password: "secret", loginType: "email" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/login",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("alice@example.com"),
      }),
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-token");
  });

  test("login uses phone field when loginType is phone", async () => {
    await login({ identifier: "+85291234567", password: "secret", loginType: "phone" });

    expect(global.fetch.mock.calls[0][1].body).toContain('"phone":"+85291234567"');
  });

  test("logout clears token", () => {
    localStorage.setItem(TOKEN_KEY, "jwt-token");
    logout();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  test("signup posts registration payload", async () => {
    const payload = { email: "alice@example.com", password: "secret", name: "Alice" };
    await signup(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      "/signup",
      expect.objectContaining({ method: "POST", body: JSON.stringify(payload) }),
    );
  });

  test("sendCode posts target and type", async () => {
    await sendCode("alice@example.com", "EMAIL");
    expect(global.fetch).toHaveBeenCalledWith(
      "/send-code",
      expect.objectContaining({
        body: JSON.stringify({ target: "alice@example.com", type: "EMAIL" }),
      }),
    );
  });

  test("sendForgotPasswordCode hits forgot-password endpoint", async () => {
    await sendForgotPasswordCode("alice@example.com", "EMAIL");
    expect(global.fetch.mock.calls[0][0]).toBe("/forgot-password/send-code");
  });

  test("resetPassword posts reset payload", async () => {
    const payload = {
      email: "alice@example.com",
      code: "123456",
      new_password: "new-secret",
    };
    await resetPassword(payload);
    expect(global.fetch.mock.calls[0][0]).toBe("/forgot-password/reset");
  });

  test("exchangeWechatCode stores token", async () => {
    await exchangeWechatCode({ code: "abc", state: "xyz" });
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-token");
  });

  test("bindWechatAccount sends auth headers", async () => {
    localStorage.setItem(TOKEN_KEY, "token-1");
    await bindWechatAccount({ code: "abc", state: "xyz" });
    expect(global.fetch.mock.calls[0][0]).toBe("/auth/wechat/bind");
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer token-1");
  });

  test("getWechatAuthUrl requests platform-specific url", async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ url: "https://open.weixin.qq.com/connect/qrconnect" }),
    }));

    const result = await getWechatAuthUrl("mobile");

    expect(global.fetch.mock.calls[0][0]).toBe("/auth/wechat/url?platform=mobile");
    expect(result.url).toContain("weixin.qq.com");
  });
});
