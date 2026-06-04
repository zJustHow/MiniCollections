import { useCallback, useEffect, useRef, useState } from "react";

export default function useInfiniteSlice(fetchSlice, options = {}) {
  const {
    resetKey = "",
    enabled = true,
    pageSize = 24,
    getArgs = () => ({}),
  } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [totalElements, setTotalElements] = useState(null);
  const [totalExact, setTotalExact] = useState(true);
  const inFlightRef = useRef(false);
  const nextCursorRef = useRef(null);
  const hasMoreRef = useRef(false);

  const applySlice = useCallback((slice, append) => {
    const content = Array.isArray(slice?.content) ? slice.content : [];
    setItems((prev) => {
      if (!append) return content;
      const seen = new Set(prev.map((item) => item.id));
      const merged = [...prev];
      for (const item of content) {
        if (!seen.has(item.id)) merged.push(item);
      }
      return merged;
    });
    const more = Boolean(slice?.has_more);
    const cursor = slice?.next_cursor ?? null;
    hasMoreRef.current = more;
    nextCursorRef.current = cursor;
    setHasMore(more);
    setNextCursor(cursor);
    if (!append) {
      if (slice?.total_elements != null) {
        setTotalElements(slice.total_elements);
        setTotalExact(slice.total_exact !== false);
      } else {
        setTotalElements(null);
        setTotalExact(true);
      }
    }
  }, []);

  const loadInitial = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const slice = await fetchSlice({
        size: pageSize,
        cursor: null,
        ...getArgs(),
      });
      applySlice(slice, false);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [fetchSlice, pageSize, getArgs, applySlice]);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || !hasMoreRef.current || !nextCursorRef.current)
      return;
    inFlightRef.current = true;
    setLoadingMore(true);
    try {
      const slice = await fetchSlice({
        size: pageSize,
        cursor: nextCursorRef.current,
        ...getArgs(),
      });
      applySlice(slice, true);
    } finally {
      setLoadingMore(false);
      inFlightRef.current = false;
    }
  }, [fetchSlice, pageSize, getArgs, applySlice]);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(false);
    setNextCursor(null);
    setTotalElements(null);
    setTotalExact(true);
    hasMoreRef.current = false;
    nextCursorRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }
    // Keep showing current items while refetching (e.g. filter change) to avoid card flash.
    loadInitial();
  }, [resetKey, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    totalElements,
    totalExact,
    loadInitial,
    loadMore,
    reset,
  };
}
