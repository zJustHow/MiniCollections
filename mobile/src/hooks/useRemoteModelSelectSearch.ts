import { useCallback, useEffect, useRef, useState } from "react";
import { searchBrandObjectsForSelect } from "@minicollections/api";

export default function useRemoteModelSelectSearch({
  onError,
}: {
  onError?: (error: unknown) => void;
} = {}) {
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [results, setResults] = useState<
    Array<{ id: number | string; name?: string; image_url?: string | null }>
  >([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (keyword: string) => {
    const trimmed = keyword.trim();
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

  const onSearch = useCallback((keyword: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void search(keyword);
    }, 300);
  }, [search]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return { results, loading, onSearch, setResults };
}
