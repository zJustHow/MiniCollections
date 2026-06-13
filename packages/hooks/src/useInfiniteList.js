import { useCallback, useEffect, useRef, useState } from "react";
import { PAGE_SIZE } from "@minicollections/api";
import {
  fetchBrowseChunk,
  getNextBrowseUiPage,
  sortItemsByOrderedIds,
} from "@minicollections/core";

export default function useInfiniteList(fetchPage, options = {}) {
  const {
    resetKey = "",
    enabled = true,
    pageSize = PAGE_SIZE,
    reservedFirstPageSlots = 0,
  } = options;

  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(() => enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const loadingRef = useRef(false);
  const nextUiPageRef = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    if (enabled) {
      setItems([]);
      setTotalElements(0);
      setLoading(true);
      setLoadError(false);
      setLoadMoreError(false);
      nextUiPageRef.current = 0;
    }
  }

  const applyChunk = useCallback((response, append) => {
    const content = Array.isArray(response?.content) ? response.content : [];
    setItems((current) => (append ? [...current, ...content] : content));
    setTotalElements(response?.total_elements ?? 0);
    return content.length;
  }, []);

  const loadInitial = useCallback(async () => {
    if (!enabled) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetchBrowseChunk(
        fetchPageRef.current,
        0,
        pageSize,
        reservedFirstPageSlots,
      );
      applyChunk(response, false);
      nextUiPageRef.current = getNextBrowseUiPage(
        Array.isArray(response?.content) ? response.content.length : 0,
        pageSize,
        reservedFirstPageSlots,
      );
    } catch {
      applyChunk(
        { content: [], total_elements: 0, total_pages: 0, total_exact: true },
        false,
      );
      nextUiPageRef.current = 0;
      setLoadError(true);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [applyChunk, enabled, pageSize, reservedFirstPageSlots]);

  const loadMore = useCallback(async () => {
    if (!enabled || loadingRef.current || loading || loadingMore) return;
    if (items.length >= totalElements) return;

    loadingRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const uiPage = nextUiPageRef.current;
      const response = await fetchBrowseChunk(
        fetchPageRef.current,
        uiPage,
        pageSize,
        reservedFirstPageSlots,
      );
      const chunkLength = applyChunk(response, true);
      if (chunkLength > 0) {
        nextUiPageRef.current = getNextBrowseUiPage(
          items.length + chunkLength,
          pageSize,
          reservedFirstPageSlots,
        );
      }
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [
    applyChunk,
    enabled,
    items.length,
    loading,
    loadingMore,
    pageSize,
    reservedFirstPageSlots,
    totalElements,
  ]);

  const retry = useCallback(async () => {
    nextUiPageRef.current = 0;
    await loadInitial();
  }, [loadInitial]);

  const retryLoadMore = useCallback(async () => {
    await loadMore();
  }, [loadMore]);

  const refresh = useCallback(async () => {
    nextUiPageRef.current = 0;
    await loadInitial();
  }, [loadInitial]);

  const reorderLocalItems = useCallback((orderedIds) => {
    setItems((current) => {
      const next = sortItemsByOrderedIds(current, orderedIds);
      if (
        next.length === current.length &&
        next.every((item, index) => item.id === current[index]?.id)
      ) {
        return current;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setItems((current) => (current.length === 0 ? current : []));
      setTotalElements((current) => (current === 0 ? current : 0));
      setLoading((current) => (current === false ? current : false));
      setLoadingMore((current) => (current === false ? current : false));
      setLoadError((current) => (current === false ? current : false));
      setLoadMoreError((current) => (current === false ? current : false));
      nextUiPageRef.current = 0;
      return;
    }
    loadInitial();
  }, [enabled, resetKey, loadInitial]);

  const hasMore = enabled && items.length < totalElements;

  return {
    items,
    setItems,
    totalElements,
    loading,
    loadingMore,
    loadError,
    loadMoreError,
    hasMore,
    loadMore,
    retry,
    retryLoadMore,
    refresh,
    reorderLocalItems,
  };
}
