import { useEffect, useRef } from "react";
import { Button, Spin } from "antd";
import { useLocale } from "../LocaleContext";

export default function InfiniteSliceFooter({
  hasMore,
  loading,
  loadingMore,
  onLoadMore,
  itemCount,
  totalElements,
  totalExact,
}) {
  const { t } = useLocale();
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore]);

  if (loading && itemCount === 0) {
    return null;
  }

  const countLabel =
    totalElements != null && !(totalElements === 0 && itemCount > 0)
      ? totalExact
        ? t("showingCountOfTotal")
            .replace("{shown}", itemCount)
            .replace("{total}", totalElements)
        : t("showingCountOfTotalPlus")
            .replace("{shown}", itemCount)
            .replace("{total}", totalElements)
      : t("showingCount").replace("{shown}", itemCount);

  return (
    <div style={{ marginTop: 24, textAlign: "center" }}>
      {itemCount > 0 && (
        <div
          style={{ marginBottom: 12, color: "var(--neu-text-2)", fontSize: 13 }}
        >
          {countLabel}
        </div>
      )}
      {hasMore ? (
        <>
          <Button loading={loadingMore} onClick={onLoadMore}>
            {t("loadMore")}
          </Button>
          <div ref={sentinelRef} style={{ height: 1 }} />
        </>
      ) : itemCount > 0 ? (
        <div style={{ color: "var(--neu-text-2)", fontSize: 13 }}>
          {t("allLoaded")}
        </div>
      ) : null}
      {loadingMore && (
        <div style={{ marginTop: 12 }}>
          <Spin size="small" />
        </div>
      )}
    </div>
  );
}
