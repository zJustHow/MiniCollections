import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import HolderOutlined from "@ant-design/icons/es/icons/HolderOutlined.js";
import NeuCard from "../NeuCard";

function SortableNeuCard({
  id,
  sortEnabled,
  disabled,
  className = "",
  ...cardProps
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: disabled || !sortEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: sortEnabled ? "none" : undefined,
  };

  const dragHandle =
    sortEnabled && !disabled ? (
      <span
        role="button"
        tabIndex={0}
        className="neu-card-drag-handle"
        aria-label="Reorder"
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <HolderOutlined />
      </span>
    ) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "neu-sortable-card-wrap",
        isDragging && "neu-sortable-card-wrap--dragging",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dragHandle ? (
        <div className="neu-sortable-card-handle-slot">{dragHandle}</div>
      ) : null}
      <NeuCard {...cardProps} />
    </div>
  );
}

export default memo(SortableNeuCard);
