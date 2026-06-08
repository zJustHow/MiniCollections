import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../utils";
import { scrollAppToTop } from "../utils/scroll";
import { mutateSearchParams } from "../utils/searchParams";

function parsePageParam(searchParams, key) {
  const raw = searchParams.get(key);
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 0;
  return parsed - 1;
}

export default function useCombinedBrandSearch(fetchPage, options = {}) {
  const {
    resetKey = "",
    enabled = true,
    pageSize = PAGE_SIZE,
    pageParamKey = "searchPage",
  } = options;

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [objects, setObjects] = useState([]);
  const [page, setPage] = useState(0);
  const [totalBrands, setTotalBrands] = useState(0);
  const [totalObjects, setTotalObjects] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalExact, setTotalExact] = useState(true);
  const [loading, setLoading] = useState(false);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const prevResetKeyRef = useRef(null);
  const pendingScrollRef = useRef(false);
  const loadPageRef = useRef(() => {});

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    if (enabled) {
      setBrands([]);
      setObjects([]);
      setPage(0);
      setTotalBrands(0);
      setTotalObjects(0);
      setTotalElements(0);
      setTotalPages(0);
      setTotalExact(true);
      setLoading(true);
    }
  }

  const applyPage = useCallback((response) => {
    setBrands(Array.isArray(response?.brands) ? response.brands : []);
    setObjects(Array.isArray(response?.objects) ? response.objects : []);
    setPage(response?.page ?? 0);
    setTotalBrands(response?.total_brands ?? 0);
    setTotalObjects(response?.total_objects ?? 0);
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
        const response = await fetchPage({ page: targetPage, size: pageSize });
        const responseTotalPages = response?.total_pages ?? 0;
        const responseTotalElements = response?.total_elements ?? 0;
        const brandCount = Array.isArray(response?.brands) ? response.brands.length : 0;
        const objectCount = Array.isArray(response?.objects) ? response.objects.length : 0;
        if (
          brandCount === 0 &&
          objectCount === 0 &&
          responseTotalElements > 0 &&
          targetPage > 0 &&
          responseTotalPages > 0 &&
          targetPage >= responseTotalPages
        ) {
          clearPageParam();
          const retry = await fetchPage({ page: 0, size: pageSize });
          applyPage(retry);
          return;
        }
        applyPage(response);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, pageSize, applyPage, clearPageParam],
  );

  loadPageRef.current = loadPage;

  const reset = useCallback(() => {
    setBrands([]);
    setObjects([]);
    setPage(0);
    setTotalBrands(0);
    setTotalObjects(0);
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
  }, [resetKey, enabled, searchParams, pageParamKey, clearPageParam, reset]);

  useEffect(() => {
    if (!pendingScrollRef.current || loading) return;
    pendingScrollRef.current = false;
    requestAnimationFrame(() => {
      scrollAppToTop();
    });
  }, [loading, page, brands, objects]);

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
    brands,
    objects,
    page,
    totalBrands,
    totalObjects,
    totalElements,
    totalPages,
    totalExact,
    loading,
    loadPage,
    onPageChange,
    reset,
  };
}
