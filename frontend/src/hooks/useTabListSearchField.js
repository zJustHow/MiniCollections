import { useCallback } from "react";
import useDraftSearchQuery from "./useDraftSearchQuery";

/** Draft search input wired to a tab-level `onSearch` handler. */
export default function useTabListSearchField(searchValue, onSearch) {
  const [draftQuery, setDraftQuery] = useDraftSearchQuery(searchValue);

  const handleDraftChange = useCallback(
    (value) => {
      setDraftQuery(value);
      if (value === "") {
        onSearch("");
      }
    },
    [onSearch, setDraftQuery],
  );

  return { draftQuery, handleDraftChange };
}
