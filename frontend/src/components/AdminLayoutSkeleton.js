import AdminSidebarSkeleton from "./AdminSidebarSkeleton";
import AdminTableSkeleton from "./AdminTableSkeleton";

export default function AdminLayoutSkeleton() {
  return (
    <div className="neu-admin-layout-skeleton" aria-busy="true">
      <AdminSidebarSkeleton />
      <div className="neu-admin-layout-skeleton-content">
        <AdminTableSkeleton columns={7} />
      </div>
    </div>
  );
}
