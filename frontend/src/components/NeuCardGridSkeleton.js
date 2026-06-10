import NeuCardSkeleton from "./NeuCardSkeleton";
import ObjectListPageLayout from "./ObjectListPageLayout";
import ListSearchFieldSkeleton from "./listPage/ListSearchFieldSkeleton";
import { SKELETON_CARD_COUNT } from "../utils/apiClient";

const SEARCH_SECTION_GRID_CLASS = "neu-search-section-grid";
const BROWSE_GRID_CLASS = "neu-list-page-browse-grid";

export default function NeuCardGridSkeleton({
  variant = "catalog",
  className = "neu-list-page-browse-grid",
  reserveSearchRow = false,
}) {
  const isSearchSectionGrid = className === SEARCH_SECTION_GRID_CLASS;
  const isBrowseGrid = className === BROWSE_GRID_CLASS;
  const grid = (
    <div
      className={className}
      aria-busy={
        isSearchSectionGrid || (!reserveSearchRow && isBrowseGrid)
          ? "true"
          : undefined
      }
    >
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <NeuCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );

  if (!reserveSearchRow) {
    // display:contents grid must stay a direct child of .neu-search-objects-cards
    if (isSearchSectionGrid || isBrowseGrid) return grid;
    return <div aria-busy="true">{grid}</div>;
  }

  return (
    <ObjectListPageLayout
      search={<ListSearchFieldSkeleton />}
    >
      <div aria-busy="true">{grid}</div>
    </ObjectListPageLayout>
  );
}
