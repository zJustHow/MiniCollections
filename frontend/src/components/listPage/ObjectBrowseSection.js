import NeuCardGridSkeleton from "../NeuCardGridSkeleton";

export default function ObjectBrowseSection({
  loading,
  skeletonVariant = "object",
  gridClassName = "neu-list-page-browse-grid",
  loadingMore = false,
  children,
}) {
  if (loading) {
    return <NeuCardGridSkeleton variant={skeletonVariant} />;
  }

  return (
    <div
      className={gridClassName}
      aria-busy={loadingMore ? "true" : undefined}
      aria-live={loadingMore ? "polite" : undefined}
    >
      {children}
    </div>
  );
}
