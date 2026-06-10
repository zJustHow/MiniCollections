export default function HeaderSlotSkeleton({ endActions = 0 }) {
  return (
    <div className="header-slot-bar neu-header-slot-skeleton" aria-busy="true">
      <div className="header-slot-actions">
        <span className="neu-header-slot-skeleton-btn" />
      </div>
      {endActions > 0 ? (
        <div className="header-slot-actions header-slot-actions-end">
          {Array.from({ length: endActions }, (_, index) => (
            <span
              key={index}
              className="neu-header-slot-skeleton-btn"
            />
          ))}
        </div>
      ) : null}
      <span className="neu-header-slot-skeleton-title" />
    </div>
  );
}
