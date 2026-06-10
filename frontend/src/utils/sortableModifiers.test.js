import { describe, expect, test, vi } from "vitest";
import { sortablePointerCollision } from "./sortableModifiers";

vi.mock("@dnd-kit/core", () => ({
  pointerWithin: vi.fn(() => [{ id: "skeleton-0" }]),
  closestCenter: vi.fn(() => [{ id: "card-1" }]),
}));

describe("sortableModifiers", () => {
  test("sortablePointerCollision prefers pointer hits", async () => {
    const { pointerWithin, closestCenter } = await import("@dnd-kit/core");
    const args = { active: { id: 1 } };

    expect(sortablePointerCollision(args)).toEqual([{ id: "skeleton-0" }]);
    expect(pointerWithin).toHaveBeenCalledWith(args);
    expect(closestCenter).not.toHaveBeenCalled();
  });

  test("sortablePointerCollision falls back to closest center", async () => {
    const { pointerWithin, closestCenter } = await import("@dnd-kit/core");
    pointerWithin.mockReturnValueOnce([]);
    const args = { active: { id: 1 } };

    expect(sortablePointerCollision(args)).toEqual([{ id: "card-1" }]);
    expect(closestCenter).toHaveBeenCalledWith(args);
  });
});
