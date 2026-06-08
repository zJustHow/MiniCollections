import {
  createGroup,
  deleteGroup,
  getGroupsPage,
  searchGroupsCombinedPage,
  updateGroup,
} from "./groupsApi";
import { TOKEN_KEY } from "./apiClient";

describe("groupsApi", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "token-1");
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true }),
    }));
  });

  test("getGroupsPage requests paginated groups", async () => {
    await getGroupsPage({ page: 1, size: 24 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/groups?");
    expect(url).toContain("page=1");
    expect(url).toContain("size=24");
  });

  test("searchGroupsCombinedPage includes keyword", async () => {
    await searchGroupsCombinedPage("kyosho", { page: 0, size: 48 });
    expect(global.fetch.mock.calls[0][0]).toContain("keyword=kyosho");
  });

  test("createGroup posts JSON payload", async () => {
    const payload = { name: "Favorites" };
    await createGroup(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      "/groups",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  test("updateGroup sends PUT", async () => {
    await updateGroup(9, { name: "Renamed" });
    expect(global.fetch.mock.calls[0][0]).toBe("/groups/9");
    expect(global.fetch.mock.calls[0][1].method).toBe("PUT");
  });

  test("deleteGroup sends DELETE", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 204 }));
    await deleteGroup(4);
    expect(global.fetch).toHaveBeenCalledWith(
      "/groups/4",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
