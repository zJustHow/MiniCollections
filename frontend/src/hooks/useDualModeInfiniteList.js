import useInfiniteList from "./useInfiniteList";
import usePagedList from "./usePagedList";

/** Infinite browse list + paginated keyword search with a single active handle. */
export default function useDualModeInfiniteList({
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
  const browseList = useInfiniteList(fetchListPage, {
    resetKey: `${listResetKey}:${entityKey}`,
    enabled: !searchActive,
    pageSize,
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
    displayItems: searchActive ? searchList.items : browseList.items,
  };
}
