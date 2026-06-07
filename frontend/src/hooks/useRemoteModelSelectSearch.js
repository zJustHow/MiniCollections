import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchBrandObjectsForSelect } from "../utils";
import { debounce } from "../utils/debounce";

export default function useRemoteModelSelectSearch({ onError } = {}) {
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  const search = useCallback(async (keyword) => {
    const trimmed = (keyword ?? "").trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const data = await searchBrandObjectsForSelect(trimmed);
      if (requestId === requestIdRef.current) setResults(data);
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setResults([]);
        onErrorRef.current?.(err);
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const searchRef = useRef(search);
  searchRef.current = search;

  const onSearch = useMemo(
    () => debounce((keyword) => searchRef.current(keyword), 300),
    [],
  );

  useEffect(() => () => onSearch.cancel(), [onSearch]);

  return { results, loading, onSearch, setResults };
}
