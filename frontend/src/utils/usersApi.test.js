import { getMe, updateIdentifier, updateLocale, updatePassword, updateProfile, uploadAvatar } from "./usersApi";
import { TOKEN_KEY } from "./apiClient";

describe("usersApi", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "token-1");
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: 1, display_name: "Alice" }),
    }));
  });

  test("getMe fetches profile", async () => {
    await getMe();
    expect(global.fetch).toHaveBeenCalledWith(
      "/users/me",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-1" }),
      }),
    );
  });

  test("updateProfile patches display name", async () => {
    await updateProfile({ displayName: "Ada" });
    expect(global.fetch).toHaveBeenCalledWith(
      "/users/me",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ display_name: "Ada" }),
      }),
    );
  });

  test("updatePassword patches password fields", async () => {
    await updatePassword({ currentPassword: "old", newPassword: "new" });
    expect(global.fetch.mock.calls[0][0]).toBe("/users/me/password");
    expect(global.fetch.mock.calls[0][1].body).toContain("current_password");
  });

  test("updateLocale patches preferred locale", async () => {
    await updateLocale("zh-CN");
    expect(global.fetch).toHaveBeenCalledWith(
      "/users/me/locale",
      expect.objectContaining({
        body: JSON.stringify({ preferred_locale: "zh-CN" }),
      }),
    );
  });

  test("updateIdentifier patches identifier payload", async () => {
    const payload = { type: "email", identifier: "new@example.com", code: "123456" };
    await updateIdentifier(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "/users/me/identifier",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    );
  });

  test("uploadAvatar posts multipart form data", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    await uploadAvatar(file);

    expect(global.fetch).toHaveBeenCalledWith(
      "/uploads/users/me/avatar",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    const formData = global.fetch.mock.calls[0][1].body;
    expect(formData.get("file")).toBe(file);
  });
});
