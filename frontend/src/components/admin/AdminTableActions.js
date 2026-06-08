export function adminTableActionsCellProps() {
  return {
    className: "admin-table-actions-cell",
    onClick: (event) => event.stopPropagation(),
    onMouseDown: (event) => event.stopPropagation(),
  };
}

export default function AdminTableActions({ children }) {
  return <div className="admin-table-actions">{children}</div>;
}
