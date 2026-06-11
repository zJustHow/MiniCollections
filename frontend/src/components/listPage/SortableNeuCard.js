import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import NeuCard from "../NeuCard";

function SortableNeuCardOverlay({
  className = "",
  sortEnabled,
  id,
  disabled,
  ...cardProps
}) {
  return (
    <div
      className={[
        "neu-sortable-card-wrap",
        "neu-sortable-card-wrap--dragging",
        "neu-sortable-card-wrap--overlay",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <NeuCard {...cardProps} hoverable={false} />
    </div>
  );
}

function SortableNeuCardSortable({
  id,
  sortEnabled,
  disabled,
  className = "",
  ...cardProps
}) {
  const isSortable = sortEnabled && !disabled;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isSortable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : undefined,
    touchAction: isDragging ? "none" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "neu-sortable-card-wrap",
        isSortable && "neu-sortable-card-wrap--sortable",
        isDragging && "neu-sortable-card-wrap--dragging",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...(isSortable ? attributes : null)}
      {...(isSortable ? listeners : null)}
      aria-label={isSortable ? cardProps.name : undefined}
    >
      <NeuCard {...cardProps} />
    </div>
  );
}

function SortableNeuCard({ overlay = false, ...props }) {
  if (overlay) {
    return <SortableNeuCardOverlay {...props} />;
  }
  return <SortableNeuCardSortable {...props} />;
}

export default memo(SortableNeuCard);
