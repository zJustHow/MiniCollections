const SECTIONS = [
  { key: "a", options: 4 },
  { key: "b", options: 3 },
  { key: "c", options: 5 },
];

export default function FilterPanelSkeleton() {
  return (
    <div className="neu-filter-skeleton" aria-hidden="true">
      <div className="neu-filter-skeleton-title neu-skeleton-shimmer" />
      {SECTIONS.map((section) => (
        <div key={section.key} className="neu-filter-skeleton-section">
          <div className="neu-filter-skeleton-section-title neu-skeleton-shimmer" />
          <div className="neu-filter-skeleton-options">
            {Array.from({ length: section.options }, (_, index) => (
              <div
                key={index}
                className="neu-filter-skeleton-option neu-skeleton-shimmer"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
