import { useEffect, useState } from "react";
import { EMPTY_SEARCH_FACETS } from "../utils/objectFilterUtils";

export default function useSearchObjectFacets({ enabled, fetchFacets, deps = [] }) {
  const [searchFacets, setSearchFacets] = useState(null);
  const [facetsLoading, setFacetsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setSearchFacets(null);
      setFacetsLoading(false);
      return undefined;
    }

    let cancelled = false;
    setFacetsLoading(true);
    fetchFacets()
      .then((data) => {
        if (!cancelled) {
          setSearchFacets(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchFacets(EMPTY_SEARCH_FACETS);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFacetsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      setFacetsLoading(false);
    };
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { searchFacets, facetsLoading, setSearchFacets };
}
