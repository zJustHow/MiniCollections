import { useEffect, useState } from "react";

/** Keeps a local search draft in sync with the URL `q` value. */
export default function useDraftSearchQuery(searchValue) {
  const [draftQuery, setDraftQuery] = useState(searchValue ?? "");

  useEffect(() => {
    setDraftQuery(searchValue ?? "");
  }, [searchValue]);

  return [draftQuery, setDraftQuery];
}
