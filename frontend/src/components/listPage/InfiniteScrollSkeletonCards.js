import { useSortable } from "@dnd-kit/sortable";
import NeuCardSkeleton from "../NeuCardSkeleton";

const LOAD_MORE_SKELETON_COUNTS = {
  catalog: 4,
  object: 6,
};

export const LOAD_MORE_SKELETON_ID_PREFIX = "__load-more-skeleton-";

export function buildLoadMoreSkeletonIds({
  variant = "catalog",
  sortEnabled = false,
  loadingMore = false,
} = {}) {
  if (!sortEnabled || !loadingMore) {
    return [];
  }

  const count =
    LOAD_MORE_SKELETON_COUNTS[variant] ?? LOAD_MORE_SKELETON_COUNTS.catalog;

  return Array.from(
    { length: count },
    (_, index) => `${LOAD_MORE_SKELETON_ID_PREFIX}${index}`,
  );
}

export function isLoadMoreSkeletonId(id) {
  return String(id).startsWith(LOAD_MORE_SKELETON_ID_PREFIX);
}

function SortableSkeletonCard({ id, variant }) {
  const { setNodeRef } = useSortable({
    id,
    disabled: { draggable: true, droppable: false },
    animateLayoutChanges: () => false,
  });

  return (
    <div ref={setNodeRef} className="neu-sortable-skeleton-wrap">
      <NeuCardSkeleton variant={variant} />
    </div>
  );
}

export default function InfiniteScrollSkeletonCards({
  variant = "catalog",
  sortEnabled = false,
}) {
  const count =
    LOAD_MORE_SKELETON_COUNTS[variant] ?? LOAD_MORE_SKELETON_COUNTS.catalog;

  return Array.from({ length: count }, (_, index) => {
    const id = `${LOAD_MORE_SKELETON_ID_PREFIX}${index}`;
    return sortEnabled ? (
      <SortableSkeletonCard key={id} id={id} variant={variant} />
    ) : (
      <NeuCardSkeleton key={id} variant={variant} />
    );
  });
}
