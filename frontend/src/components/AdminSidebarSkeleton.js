const STATUS_NAV_ITEMS = 4;

export default function AdminSidebarSkeleton() {
  return (
    <div className="neu-admin-sidebar-skeleton neu-panel" aria-busy="true">
      <span className="neu-card-skeleton-line neu-admin-sidebar-skeleton-section-title" />
      {Array.from({ length: STATUS_NAV_ITEMS }, (_, index) => (
        <div key={index} className="neu-admin-sidebar-skeleton-nav-item">
          <span className="neu-card-skeleton-line neu-admin-sidebar-skeleton-nav-label" />
          <span className="neu-card-skeleton-line neu-admin-sidebar-skeleton-nav-count" />
        </div>
      ))}
      <div className="neu-admin-sidebar-skeleton-divider" />
      <span className="neu-card-skeleton-line neu-admin-sidebar-skeleton-section-title" />
      <div className="neu-admin-sidebar-skeleton-nav-item">
        <span className="neu-card-skeleton-line neu-admin-sidebar-skeleton-nav-label" />
      </div>
    </div>
  );
}
