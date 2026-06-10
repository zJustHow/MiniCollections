import { useEffect, useRef } from "react";

export default function InfiniteScrollSentinel({
  enabled,
  loading,
  onLoadMore,
  className = "neu-infinite-scroll-sentinel",
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || loading) return undefined;

    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { root: null, rootMargin: "240px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, loading, onLoadMore]);

  if (!enabled) return null;

  return (
    <div
      ref={sentinelRef}
      className={className}
      aria-hidden="true"
      data-testid="infinite-scroll-sentinel"
    />
  );
}
