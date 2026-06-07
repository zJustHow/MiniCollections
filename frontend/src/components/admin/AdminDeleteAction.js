import ConfirmDeleteButton from "../ConfirmDeleteButton";

export default function AdminDeleteAction({ onConfirm }) {
  return (
    <span
      className="admin-delete-action"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <ConfirmDeleteButton variant="neu" size="small" onConfirm={onConfirm} />
    </span>
  );
}
