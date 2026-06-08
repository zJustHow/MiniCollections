const COLUMN_TEMPLATES = {
  3: "60px 1fr 80px",
  7: "60px 120px 140px 100px 1fr 110px 160px",
  8: "60px 1fr 120px 80px 100px 110px 100px 90px",
};

export default function AdminTableSkeleton({ rows = 10, columns = 6 }) {
  const gridTemplateColumns =
    COLUMN_TEMPLATES[columns] ?? `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <div className="neu-panel neu-table-skeleton" aria-busy="true">
      <div
        className="neu-table-skeleton-header"
        style={{ gridTemplateColumns }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <div
            key={index}
            className="neu-table-skeleton-cell neu-table-skeleton-cell--header neu-skeleton-shimmer"
          />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className="neu-table-skeleton-row"
          style={{ gridTemplateColumns }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <div
              key={colIndex}
              className="neu-table-skeleton-cell neu-skeleton-shimmer"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
