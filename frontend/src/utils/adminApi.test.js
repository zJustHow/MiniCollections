import {
  adminCreateBrand,
  adminCreateBrandObject,
  adminCreateSeries,
  adminDeleteBrand,
  adminDeleteBrandObject,
  adminDeleteSeries,
  adminUpdateBrand,
  adminUpdateBrandObject,
  adminUpdateSeries,
} from "./adminApi";
import { TOKEN_KEY } from "./apiClient";

describe("adminApi", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "admin-token");
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    }));
  });

  test("adminCreateBrand posts to admin brands endpoint", async () => {
    const payload = { nameEn: "Kyosho", nameZh: "京商" };
    await adminCreateBrand(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/brands",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  test("adminUpdateBrand sends PUT", async () => {
    await adminUpdateBrand(3, { nameEn: "Updated" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/brands/3",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  test("adminDeleteBrand sends DELETE", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 204 }));
    await adminDeleteBrand(3);

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/brands/3",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  test("adminCreateBrandObject posts under brand", async () => {
    const payload = { nameEn: "Model A" };
    await adminCreateBrandObject(2, payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/brands/2/objects",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  test("adminUpdateBrandObject sends PUT", async () => {
    await adminUpdateBrandObject(8, { nameEn: "Model B" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/brands/objects/8",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  test("adminDeleteBrandObject sends DELETE", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 204 }));
    await adminDeleteBrandObject(8);

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/brands/objects/8",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  test("adminCreateSeries posts under brand", async () => {
    await adminCreateSeries(4, { nameEn: "Series X" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/series/brands/4",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("adminUpdateSeries sends PUT", async () => {
    await adminUpdateSeries(6, { nameEn: "Series Y" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/series/6",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  test("adminDeleteSeries sends DELETE", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 204 }));
    await adminDeleteSeries(6);

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/series/6",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
