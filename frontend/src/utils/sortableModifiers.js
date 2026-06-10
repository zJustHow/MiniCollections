import { closestCenter, pointerWithin } from "@dnd-kit/core";

/** Prefer pointer hits so cards can drop while the cursor is over skeleton slots. */
export function sortablePointerCollision(args) {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return pointerHits;
  }
  return closestCenter(args);
}
