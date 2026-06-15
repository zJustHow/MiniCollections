import { SKELETON_CARD_COUNT } from "@minicollections/api";

export const SKELETON_ITEM_ID_PREFIX = "__skeleton-";
export const LOAD_MORE_SKELETON_ID_PREFIX = "__load-more-skeleton-";
export const FEEDBACK_SKELETON_ID_PREFIX = "__feedback-skeleton-";

export const DEFAULT_FEEDBACK_SKELETON_COUNT = 5;

export const LOAD_MORE_SKELETON_COUNTS = {
  catalog: 4,
  object: 6,
} as const;

export type SkeletonVariant = keyof typeof LOAD_MORE_SKELETON_COUNTS;

export function buildInitialSkeletonItems(count = SKELETON_CARD_COUNT) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${SKELETON_ITEM_ID_PREFIX}${index}`,
  }));
}

/** Stable placeholder rows — must not be recreated per render (FlashList loops otherwise). */
export const INITIAL_SKELETON_ITEMS = buildInitialSkeletonItems();

export function buildLoadMoreSkeletonItems(variant: SkeletonVariant = "catalog") {
  const count = LOAD_MORE_SKELETON_COUNTS[variant];
  return Array.from({ length: count }, (_, index) => ({
    id: `${LOAD_MORE_SKELETON_ID_PREFIX}${index}`,
  }));
}

export function buildFeedbackSkeletonItems(
  count = DEFAULT_FEEDBACK_SKELETON_COUNT,
) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${FEEDBACK_SKELETON_ID_PREFIX}${index}`,
  }));
}

/** Stable placeholder rows for feedback lists. */
export const FEEDBACK_SKELETON_ITEMS = buildFeedbackSkeletonItems();

export function isSkeletonItem(item: { id?: number | string }) {
  const id = String(item.id ?? "");
  return (
    id.startsWith(SKELETON_ITEM_ID_PREFIX) ||
    id.startsWith(LOAD_MORE_SKELETON_ID_PREFIX) ||
    id.startsWith(FEEDBACK_SKELETON_ID_PREFIX)
  );
}

export function resolveBrowseListData<T extends { id: number | string }>(
  items: T[],
  loading: boolean,
) {
  if (loading && items.length === 0) {
    return INITIAL_SKELETON_ITEMS as T[];
  }
  return items;
}

export function resolveFeedbackListData<T extends { id: number | string }>(
  items: T[],
  loading: boolean,
) {
  if (loading && items.length === 0) {
    return FEEDBACK_SKELETON_ITEMS as T[];
  }
  return items;
}
