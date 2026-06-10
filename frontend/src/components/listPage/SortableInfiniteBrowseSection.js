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
import ListLoadError from "../ListLoadError";
import NoDataPlaceholder from "../NoDataPlaceholder";
import ObjectBrowseSection from "./ObjectBrowseSection";
import InfiniteScrollSentinel from "./InfiniteScrollSentinel";
import { shouldShowNoData } from "../../utils/listPageUtils";
import { useLocale } from "../../LocaleContext";

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    onDragEnd?.(active.id, over.id);
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
