import NoSearchResults from "./NoSearchResults";
import ObjectBrowseSection from "./ObjectBrowseSection";
import ActivePagePagination from "./ActivePagePagination";

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

  return (
    <>
      <ObjectBrowseSection
        loading={spinning}
        skeletonVariant={browseSkeletonVariant}
      >
        {browseItems.map(renderBrowseItem)}
      </ObjectBrowseSection>
      <ActivePagePagination
        activePage={browsePaginationPage}
        includeTotals={browsePaginationIncludeTotals}
      />
    </>
  );
}
