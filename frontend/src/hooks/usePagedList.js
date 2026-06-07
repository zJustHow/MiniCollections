import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../utils";
import { fetchAddCardPageData } from "../utils/addCardPagination";
import { scrollAppToTop } from "../utils/scroll";
import { mutateSearchParams } from "../utils/searchParams";

function parsePageParam(searchParams, key) {
  const raw = searchParams.get(key);
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 0;
  return parsed - 1;
}

export default function usePagedList(fetchPage, options = {}) {
  const {
    resetKey = "",
    enabled = true,
    pageSize = PAGE_SIZE,
    pageParamKey = null,
    allowEmptyPage = false,
    reservedFirstPageSlots = 0,
  } = options;

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalExact, setTotalExact] = useState(true);
  const [loading, setLoading] = useState(false);
  const prevResetKeyRef = useRef(null);
  const pendingScrollRef = useRef(false);
  const loadPageRef = useRef(() => {});

  const applyPage = useCallback((response) => {
    setItems(Array.isArray(response?.content) ? response.content : []);
    setPage(response?.page ?? 0);
    setTotalElements(response?.total_elements ?? 0);
    setTotalPages(response?.total_pages ?? 0);
    setTotalExact(response?.total_exact !== false);
  }, []);

  const clearPageParam = useCallback(() => {
    if (!pageParamKey) return;
    mutateSearchParams(
      setSearchParams,
      (next) => {
        next.delete(pageParamKey);
      },
      { replace: true, state: location.state },
    );
  }, [pageParamKey, setSearchParams, location.state]);

  const loadPage = useCallback(
    async (targetPage) => {
      setLoading(true);
      try {
        const response = await fetchAddCardPageData(
          fetchPage,
          targetPage,
          pageSize,
          reservedFirstPageSlots,
        );
        const totalPages = response?.total_pages ?? 0;
        const totalElements = response?.total_elements ?? 0;
        const contentLength = Array.isArray(response?.content)
          ? response.content.length
          : 0;
        if (
          !allowEmptyPage &&
          contentLength === 0 &&
          totalElements > 0 &&
          targetPage > 0 &&
          totalPages > 0 &&
          targetPage >= totalPages
        ) {
          clearPageParam();
          const retry = await fetchAddCardPageData(
            fetchPage,
            0,
            pageSize,
            reservedFirstPageSlots,
          );
          applyPage(retry);
          return;
        }
        applyPage(response);
      } finally {
        setLoading(false);
      }
    },
    [
      fetchPage,
      pageSize,
      applyPage,
      clearPageParam,
      allowEmptyPage,
      reservedFirstPageSlots,
    ],
  );

  loadPageRef.current = loadPage;

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setTotalElements(0);
    setTotalPages(0);
    setTotalExact(true);
  }, []);

  const setPageParam = useCallback(
    (pageZeroBased) => {
      if (!pageParamKey) return;
      mutateSearchParams(
        setSearchParams,
        (next) => {
          const oneBased = pageZeroBased + 1;
          if (oneBased <= 1) {
            next.delete(pageParamKey);
          } else {
            next.set(pageParamKey, String(oneBased));
          }
        },
        { replace: true, state: location.state },
      );
    },
    [pageParamKey, setSearchParams, location.state],
  );

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    const resetKeyChanged =
      prevResetKeyRef.current !== null && prevResetKeyRef.current !== resetKey;
    prevResetKeyRef.current = resetKey;

    if (resetKeyChanged) {
      clearPageParam();
      loadPageRef.current(0);
      return;
    }

    const initialPage = pageParamKey
      ? parsePageParam(searchParams, pageParamKey)
      : 0;
    loadPageRef.current(initialPage);
  }, [resetKey, enabled, reservedFirstPageSlots, searchParams, pageParamKey, clearPageParam, reset]);

  useEffect(() => {
    if (!pendingScrollRef.current || loading) return;
    pendingScrollRef.current = false;
    requestAnimationFrame(() => {
      scrollAppToTop();
    });
  }, [loading, page, items]);

  const onPageChange = useCallback(
    (nextPageOneBased) => {
      const targetPage = nextPageOneBased - 1;
      pendingScrollRef.current = true;
      setPageParam(targetPage);
      loadPage(targetPage);
    },
    [loadPage, setPageParam],
  );

  return {
    items,
    page,
    totalElements,
    totalPages,
    totalExact,
    loading,
    loadPage,
    onPageChange,
    reset,
  };
}
