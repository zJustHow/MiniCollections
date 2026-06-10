import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import NeuCard from "../NeuCard";

function SortableNeuCard({
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
    touchAction: isSortable ? "none" : undefined,
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

export default memo(SortableNeuCard);
