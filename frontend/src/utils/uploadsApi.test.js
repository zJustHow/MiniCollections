import {
  discardUploadedImage,
  uploadBrandLogo,
  uploadImage,
} from "./uploadsApi";
import { TOKEN_KEY } from "./apiClient";

describe("uploadsApi", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "user-token");
    global.fetch = vi.fn();
  });

  test("uploadImage posts multipart form and returns url", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://cdn.example.com/a.png" }),
    });

    const file = new File(["x"], "photo.png", { type: "image/png" });
    const url = await uploadImage(file);

    expect(url).toBe("https://cdn.example.com/a.png");
    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("file")).toBe(file);
  });

  test("uploadImage throws on failure", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      text: async () => '{"code":"uploadFailed"}',
    });

    const file = new File(["x"], "photo.png", { type: "image/png" });
    await expect(uploadImage(file)).rejects.toThrow();
  });

  test("discardUploadedImage no-ops for empty url", async () => {
    await discardUploadedImage("");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("discardUploadedImage sends DELETE with encoded url", async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 204 });

    await discardUploadedImage("https://cdn.example.com/a.png");

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/uploads/image?");
    expect(url).toContain(encodeURIComponent("https://cdn.example.com/a.png"));
    expect(options.method).toBe("DELETE");
  });

  test("uploadBrandLogo posts to admin brand logo endpoint", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: "https://cdn.example.com/logo.png" }),
    });

    const file = new File(["x"], "logo.png", { type: "image/png" });
    const result = await uploadBrandLogo(5, file);

    expect(result.imageUrl).toBe("https://cdn.example.com/logo.png");
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/admin/brands/5/logo");
    expect(options.method).toBe("POST");
    expect(options.body.get("file")).toBe(file);
  });

  test("uploadBrandLogo throws on failure", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      text: async () => '{"code":"uploadFailed"}',
    });

    const file = new File(["x"], "logo.png", { type: "image/png" });
    await expect(uploadBrandLogo(5, file)).rejects.toThrow();
  });

  test("discardUploadedImage throws on failure", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => '{"code":"error.request_failed"}',
    });

    await expect(discardUploadedImage("https://cdn.example.com/a.png")).rejects.toThrow();
  });
});
