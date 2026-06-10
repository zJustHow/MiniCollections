import { getCollectionStats } from "./statsApi";
import { TOKEN_KEY } from "./apiClient";

describe("statsApi", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "token-1");
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ total_objects: 0 }),
    }));
  });

  test("getCollectionStats requests user collection stats", async () => {
    await getCollectionStats();
    expect(global.fetch.mock.calls[0][0]).toBe("/users/me/collection-stats");
  });

  test("getCollectionStats returns parsed payload", async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        total_objects: 12,
        by_category: [{ id: 1, name_en: "Cars", count: 5 }],
      }),
    }));

    const stats = await getCollectionStats();
    expect(stats.total_objects).toBe(12);
    expect(stats.by_category[0].name_en).toBe("Cars");
  });
});
