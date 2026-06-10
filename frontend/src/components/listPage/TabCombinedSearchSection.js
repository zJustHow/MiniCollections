import NeuCardGridSkeleton from "../NeuCardGridSkeleton";
import ObjectSearchFilterLayout from "../ObjectSearchFilterLayout";

export default function TabCombinedSearchSection({
  spinning,
  withFilterLayout = false,
  filterLayoutProps,
  hasResults,
  showPrimaryCards,
  showObjectSection,
  showObjectCards,
  showDivider,
  primaryCards,
  objectCards,
}) {
  if (spinning) {
    const skeleton = (
      <NeuCardGridSkeleton variant="object" className="neu-search-section-grid" />
    );
    if (withFilterLayout) {
      return (
        <ObjectSearchFilterLayout {...filterLayoutProps}>
          {skeleton}
        </ObjectSearchFilterLayout>
      );
    }
    return <div className="neu-search-objects-cards">{skeleton}</div>;
  }

  if (!hasResults) return null;

  const content = (
    <>
      {showPrimaryCards ? (
        <div className="neu-search-section-grid">{primaryCards}</div>
      ) : null}
      {showDivider ? (
        <div className="neu-search-section-divider" role="separator" />
      ) : null}
      {showObjectSection && showObjectCards ? (
        <div className="neu-search-section-grid">{objectCards}</div>
      ) : null}
    </>
  );

  if (withFilterLayout) {
    return (
      <ObjectSearchFilterLayout {...filterLayoutProps}>{content}</ObjectSearchFilterLayout>
    );
  }

  return <div className="neu-search-objects-cards">{content}</div>;
}
