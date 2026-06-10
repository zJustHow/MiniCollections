import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import ObjectBrowseSection from "./ObjectBrowseSection";
import InfiniteScrollSentinel from "./InfiniteScrollSentinel";

export default function SortableInfiniteBrowseSection({
  loading,
  orderLoading,
  items,
  renderItem,
  sortableIds,
  sortEnabled,
  onDragEnd,
  hasMore,
  loadingMore,
  onLoadMore,
  skeletonVariant = "catalog",
  gridClassName,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const spinning = loading || orderLoading;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    onDragEnd?.(active.id, over.id);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortEnabled ? sortableIds : []}
          strategy={rectSortingStrategy}
        >
          <ObjectBrowseSection
            loading={spinning}
            skeletonVariant={skeletonVariant}
            gridClassName={gridClassName}
          >
            {spinning ? null : items.map(renderItem)}
          </ObjectBrowseSection>
        </SortableContext>
      </DndContext>
      {!spinning ? (
        <>
          {loadingMore ? (
            <div className="neu-infinite-scroll-loading" aria-live="polite">
              …
            </div>
          ) : null}
          <InfiniteScrollSentinel
            enabled={hasMore}
            loading={loadingMore}
            onLoadMore={onLoadMore}
          />
        </>
      ) : null}
    </>
  );
}
