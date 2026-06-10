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
});
