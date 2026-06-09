import {
  createGroup,
  createUserObject,
  deleteGroup,
  deleteUserObject,
  getGroupById,
  getGroupsPage,
  getUserObjectById,
  getUserObjectsPage,
  searchGroupObjectsPage,
  searchGroupsCombinedPage,
  updateGroup,
  updateUserObject,
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

  test("getGroupById fetches group detail", async () => {
    await getGroupById(3);
    expect(global.fetch.mock.calls[0][0]).toBe("/groups/3");
  });

  test("getUserObjectsPage requests group objects", async () => {
    await getUserObjectsPage(3, { page: 0, size: 48 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/groups/3/objects?");
    expect(url).toContain("size=48");
  });

  test("getUserObjectById fetches user object detail", async () => {
    await getUserObjectById(3, 8);
    expect(global.fetch.mock.calls[0][0]).toBe("/groups/3/objects/8");
  });

  test("searchGroupObjectsPage includes keyword", async () => {
    await searchGroupObjectsPage(3, "bmw", { page: 1, size: 24 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/groups/3/objects/search?");
    expect(url).toContain("keyword=bmw");
    expect(url).toContain("page=1");
  });

  test("createUserObject posts payload", async () => {
    const payload = { brandObjectId: 5, name: "My M3" };
    await createUserObject(3, payload);
    expect(global.fetch).toHaveBeenCalledWith(
      "/groups/3/objects",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  test("updateUserObject sends PUT", async () => {
    await updateUserObject(3, 8, { name: "Renamed" });
    expect(global.fetch.mock.calls[0][0]).toBe("/groups/3/objects/8");
    expect(global.fetch.mock.calls[0][1].method).toBe("PUT");
  });

  test("deleteUserObject sends DELETE", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 204 }));
    await deleteUserObject(3, 8);
    expect(global.fetch).toHaveBeenCalledWith(
      "/groups/3/objects/8",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
