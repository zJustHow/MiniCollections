import NeuCardGridSkeleton from "../NeuCardGridSkeleton";

export default function ObjectBrowseSection({
  loading,
  skeletonVariant = "object",
  gridClassName = "neu-list-page-browse-grid",
  children,
}) {
  if (loading) {
    return <NeuCardGridSkeleton variant={skeletonVariant} />;
  }

  return <div className={gridClassName}>{children}</div>;
}
