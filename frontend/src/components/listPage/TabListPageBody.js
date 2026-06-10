import NoSearchResults from "./NoSearchResults";
import NoDataPlaceholder from "../NoDataPlaceholder";
import ObjectBrowseSection from "./ObjectBrowseSection";
import ActivePagePagination from "./ActivePagePagination";
import { shouldShowNoData } from "../../utils/listPageUtils";

export default function TabListPageBody({
  searchActive,
  spinning,
  searchHasResults,
  searchContent,
  browseItems,
  renderBrowseItem,
  browseSkeletonVariant = "catalog",
  searchPaginationPage,
  browsePaginationPage,
  searchPaginationIncludeTotals = false,
  browsePaginationIncludeTotals = true,
}) {
  if (searchActive) {
    return (
      <>
        {searchContent}
        <ActivePagePagination
          activePage={searchPaginationPage}
          includeTotals={searchPaginationIncludeTotals}
        />
        {!spinning && !searchHasResults ? <NoSearchResults /> : null}
      </>
    );
  }

  const showBrowseEmpty = shouldShowNoData(browseItems, { loading: spinning });

  return (
    <>
      {showBrowseEmpty ? (
        <NoDataPlaceholder />
      ) : (
        <ObjectBrowseSection
          loading={spinning}
          skeletonVariant={browseSkeletonVariant}
        >
          {browseItems.map(renderBrowseItem)}
        </ObjectBrowseSection>
      )}
      <ActivePagePagination
        activePage={browsePaginationPage}
        includeTotals={browsePaginationIncludeTotals}
      />
    </>
  );
}
