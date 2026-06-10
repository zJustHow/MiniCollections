import NeuCardSkeleton from "./NeuCardSkeleton";
import ObjectListPageLayout from "./ObjectListPageLayout";
import ListSearchFieldSkeleton from "./listPage/ListSearchFieldSkeleton";
import { PAGE_SIZE } from "../utils/apiClient";

const SEARCH_SECTION_GRID_CLASS = "neu-search-section-grid";

export default function NeuCardGridSkeleton({
  variant = "catalog",
  className = "neu-list-page-browse-grid",
  reserveSearchRow = false,
}) {
  const isSearchSectionGrid = className === SEARCH_SECTION_GRID_CLASS;
  const grid = (
    <div className={className} aria-busy={isSearchSectionGrid ? "true" : undefined}>
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <NeuCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );

  if (!reserveSearchRow) {
    // display:contents grid must stay a direct child of .neu-search-objects-cards
    if (isSearchSectionGrid) return grid;
    return <div aria-busy="true">{grid}</div>;
  }

  return (
    <ObjectListPageLayout
      summary={<span aria-hidden="true" />}
      search={<ListSearchFieldSkeleton />}
    >
      <div aria-busy="true">{grid}</div>
    </ObjectListPageLayout>
  );
}
