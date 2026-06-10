import { useLocation } from "react-router-dom";
import AdminSidebarSkeleton from "./AdminSidebarSkeleton";
import AdminTableSkeleton from "./AdminTableSkeleton";

function adminTableSkeletonColumns(pathname) {
  if (!pathname) return 7;
  if (/^\/admin\/brands\/[^/]+/.test(pathname)) return 8;
  if (pathname.startsWith("/admin/brands")) return 3;
  if (pathname.startsWith("/admin/categories")) return 6;
  if (pathname.startsWith("/admin/scales")) return 4;
  return 7;
}

function shouldShowAdminSidebar(pathname) {
  return (
    !pathname.startsWith("/admin/brands") &&
    !pathname.startsWith("/admin/categories") &&
    !pathname.startsWith("/admin/scales")
  );
}

export default function AdminLayoutSkeleton() {
  const { pathname } = useLocation();
  const showSidebar = shouldShowAdminSidebar(pathname);
  const columns = adminTableSkeletonColumns(pathname);

  return (
    <div className="neu-admin-layout-skeleton" aria-busy="true">
      {showSidebar ? <AdminSidebarSkeleton /> : null}
      <div className="neu-admin-layout-skeleton-content">
        <AdminTableSkeleton columns={columns} />
      </div>
    </div>
  );
}
