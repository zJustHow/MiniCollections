import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Search state for entity object list pages (brand/group detail).
 * Syncs draft input and active keyword from the URL `q` param.
 */
export default function useObjectListPageSearch({
  entityKey,
  searchValue,
  applySearch,
  clearSearch,
  onFiltersReset,
  onSearchCleared,
  resetFiltersOnKeywordChange = false,
}) {
  const [searchActive, setSearchActive] = useState(
    Boolean((searchValue ?? "").trim()),
  );
  const [searchKeyword, setSearchKeyword] = useState(
    (searchValue ?? "").trim(),
  );
  const [draftQuery, setDraftQuery] = useState(searchValue ?? "");
  const syncedKeywordRef = useRef(searchKeyword);

  useEffect(() => {
    const keyword = (searchValue ?? "").trim();
    if (keyword) {
      if (resetFiltersOnKeywordChange && keyword !== syncedKeywordRef.current) {
        onFiltersReset?.();
      }
      syncedKeywordRef.current = keyword;
      setDraftQuery(keyword);
      setSearchKeyword(keyword);
      setSearchActive(true);
    } else {
      syncedKeywordRef.current = "";
      setSearchKeyword("");
      setSearchActive(false);
      onSearchCleared?.();
    }
  }, [entityKey, searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = useCallback(
    (keyword) => {
      const trimmed = (keyword ?? "").trim();
      setDraftQuery(trimmed);
      if (!trimmed) {
        clearSearch();
        setSearchActive(false);
        setSearchKeyword("");
        syncedKeywordRef.current = "";
        return;
      }
      applySearch(trimmed);
      syncedKeywordRef.current = trimmed;
      setSearchKeyword(trimmed);
      setSearchActive(true);
    },
    [applySearch, clearSearch],
  );

  const handleDraftChange = useCallback(
    (value) => {
      setDraftQuery(value);
      if (value === "") {
        runSearch("");
      }
    },
    [runSearch],
  );

  return {
    searchActive,
    searchKeyword,
    draftQuery,
    runSearch,
    handleDraftChange,
  };
}
