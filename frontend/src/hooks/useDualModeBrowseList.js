import usePagedList from "./usePagedList";
import useOrderableInfiniteBrowse from "./useOrderableInfiniteBrowse";

/** Infinite browse list + paginated keyword search with a single active handle. */
export default function useDualModeBrowseList({
  entityKey,
  searchActive,
  searchKeyword,
  fetchListPage,
  fetchSearchPage,
  fetchOrder,
  reorder,
  listResetKey,
  searchResetKey,
  searchResetExtra = "",
  listOptions = {},
  searchOptions = {},
  pageSize,
}) {
  const browseList = useOrderableInfiniteBrowse({
    entityKey,
    enabled: !searchActive,
    fetchPage: fetchListPage,
    fetchOrder,
    reorder,
    pageSize,
    listResetKey,
    ...listOptions,
  });

  const searchList = usePagedList(fetchSearchPage, {
    resetKey: `${searchResetKey}:${entityKey}:${searchKeyword}${searchResetExtra}`,
    enabled: searchActive && Boolean(searchKeyword),
    pageSize,
    pageParamKey: "page",
    ...searchOptions,
  });

  const activeList = searchActive ? searchList : browseList;

  return {
    browseList,
    searchList,
    activeList,
    displayItems: searchActive ? searchList.items : browseList.displayItems,
  };
}
