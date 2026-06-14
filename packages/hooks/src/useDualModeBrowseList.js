import useInfiniteList from "./useInfiniteList.js";
import useOrderableInfiniteBrowse from "./useOrderableInfiniteBrowse.js";

/**
 * Infinite browse list + keyword search with a single active handle.
 * @param {object} options
 * @param {string} options.entityKey
 * @param {boolean} options.searchActive
 * @param {string} options.searchKeyword
 * @param {(args: { page: number; size: number }) => Promise<any>} options.fetchListPage
 * @param {(args: { page: number; size: number }) => Promise<any>} options.fetchSearchPage
 * @param {() => Promise<{ ids?: Array<number | string> }>} options.fetchOrder
 * @param {(orderedIds: Array<number | string>) => Promise<any>} options.reorder
 * @param {string} options.listResetKey
 * @param {string} options.searchResetKey
 * @param {string} [options.searchResetExtra]
 * @param {object} [options.listOptions]
 * @param {object} [options.searchOptions]
 * @param {number} [options.pageSize]
 * @param {boolean} [options.enabled]
 */
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
  enabled = true,
}) {
  const browseList = useOrderableInfiniteBrowse({
    entityKey,
    enabled: enabled && !searchActive,
    fetchPage: fetchListPage,
    fetchOrder,
    reorder,
    pageSize,
    listResetKey,
    ...listOptions,
  });

  const searchList = useInfiniteList(fetchSearchPage, {
    resetKey: `${searchResetKey}:${entityKey}:${searchKeyword}${searchResetExtra}`,
    enabled: enabled && searchActive && Boolean(searchKeyword),
    pageSize,
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
