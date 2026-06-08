import usePagedList from "./usePagedList";

/** Browse list + keyword search list with a single active page handle. */
export default function useDualModePagedList({
  entityKey,
  searchActive,
  searchKeyword,
  fetchListPage,
  fetchSearchPage,
  listResetKey,
  searchResetKey,
  searchResetExtra = "",
  listOptions = {},
  searchOptions = {},
  pageSize,
}) {
  const objectsList = usePagedList(fetchListPage, {
    resetKey: `${listResetKey}:${entityKey}`,
    enabled: !searchActive,
    pageSize,
    pageParamKey: "page",
    ...listOptions,
  });

  const objectsSearch = usePagedList(fetchSearchPage, {
    resetKey: `${searchResetKey}:${entityKey}:${searchKeyword}${searchResetExtra}`,
    enabled: searchActive && Boolean(searchKeyword),
    pageSize,
    pageParamKey: "page",
    ...searchOptions,
  });

  const activePage = searchActive ? objectsSearch : objectsList;

  return {
    objectsList,
    objectsSearch,
    activePage,
    displayObjects: activePage.items,
  };
}
