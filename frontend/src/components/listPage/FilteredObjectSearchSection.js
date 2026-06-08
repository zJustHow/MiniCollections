import NeuCardGridSkeleton from "../NeuCardGridSkeleton";
import ObjectSearchFilterLayout from "../ObjectSearchFilterLayout";

export default function FilteredObjectSearchSection({
  filterLayoutProps,
  loading,
  showContent,
  skeletonClassName = "neu-search-section-grid",
  children,
}) {
  if (loading) {
    return (
      <ObjectSearchFilterLayout {...filterLayoutProps}>
        <NeuCardGridSkeleton variant="object" className={skeletonClassName} />
      </ObjectSearchFilterLayout>
    );
  }

  if (!showContent) return null;

  return (
    <ObjectSearchFilterLayout {...filterLayoutProps}>
      {children}
    </ObjectSearchFilterLayout>
  );
}
