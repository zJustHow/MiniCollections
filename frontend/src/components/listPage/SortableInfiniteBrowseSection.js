import { cloneElement, isValidElement, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import ListLoadError from "../ListLoadError";
import NoDataPlaceholder from "../NoDataPlaceholder";
import ObjectBrowseSection from "./ObjectBrowseSection";
import InfiniteScrollSentinel from "./InfiniteScrollSentinel";
import InfiniteScrollSkeletonCards, {
  buildLoadMoreSkeletonIds,
  isLoadMoreSkeletonId,
} from "./InfiniteScrollSkeletonCards";
import { shouldShowNoData } from "../../utils/listPageUtils";
import { sortablePointerCollision } from "../../utils/sortableModifiers";
import { useLocale } from "../../LocaleContext";

function isSameSortableId(left, right) {
  return String(left) === String(right);
}

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
  loadError = false,
  loadMoreError = false,
  errorMessage,
  onRetry,
  onRetryLoadMore,
  skeletonVariant = "catalog",
  gridClassName,
}) {
  const { t } = useLocale();
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const spinning = loading || orderLoading;
  const showEmpty = shouldShowNoData(items, { loading: spinning });
  const resolvedErrorMessage = errorMessage ?? t("failedToLoadModels");
  const skeletonIds = buildLoadMoreSkeletonIds({
    variant: skeletonVariant,
    sortEnabled,
    loadingMore,
  });
  const sortableContextItems = sortEnabled
    ? [...sortableIds, ...skeletonIds]
    : [];

  const resolveDropTargetId = (overId) => {
    if (!isLoadMoreSkeletonId(overId)) {
      return overId;
    }
    if (sortableIds.length === 0) {
      return null;
    }
    return sortableIds[sortableIds.length - 1];
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const resolvedOverId = resolveDropTargetId(over.id);
    if (!resolvedOverId) return;
    onDragEnd?.(active.id, resolvedOverId);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId
    ? items.find((item) => isSameSortableId(item.id, activeId))
    : null;
  const showDragOverlay =
    activeItem &&
    sortableIds.some((id) => isSameSortableId(id, activeId));

  const renderDragOverlay = () => {
    if (!showDragOverlay) return null;
    const element = renderItem(activeItem);
    if (!isValidElement(element)) return null;
    return cloneElement(element, { overlay: true });
  };

  if (!spinning && loadError) {
    return (
      <ListLoadError message={resolvedErrorMessage} onRetry={onRetry} />
    );
  }

  if (showEmpty) {
    return <NoDataPlaceholder />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={sortablePointerCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortableContextItems}
          strategy={rectSortingStrategy}
        >
          <ObjectBrowseSection
            loading={spinning}
            skeletonVariant={skeletonVariant}
            gridClassName={gridClassName}
            loadingMore={loadingMore}
          >
          {spinning ? null : (
            <>
              {items.map(renderItem)}
              {loadingMore ? (
                <InfiniteScrollSkeletonCards
                  variant={skeletonVariant}
                  sortEnabled={sortEnabled}
                />
              ) : null}
            </>
          )}
          </ObjectBrowseSection>
        </SortableContext>
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>
      {!spinning ? (
        <>
          {loadMoreError ? (
            <ListLoadError
              className="neu-infinite-scroll-error"
              message={t("failedToLoadMore")}
              onRetry={onRetryLoadMore}
            />
          ) : null}
          <InfiniteScrollSentinel
            enabled={hasMore && !loadMoreError}
            loading={loadingMore}
            onLoadMore={onLoadMore}
          />
        </>
      ) : null}
    </>
  );
}
