import { lazy } from "react";

export function isChunkLoadError(error) {
  const message = error?.message ?? "";
  return (
    error?.name === "ChunkLoadError" ||
    /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      message,
    )
  );
}

export function lazyWithRetry(importFn, retryKey = "chunk-retry") {
  return lazy(async () => {
    const storageKey = `${retryKey}:${importFn.toString()}`;
    const hasRetried = sessionStorage.getItem(storageKey) === "1";

    try {
      const module = await importFn();
      sessionStorage.removeItem(storageKey);
      return module;
    } catch (error) {
      if (!hasRetried && isChunkLoadError(error)) {
        sessionStorage.setItem(storageKey, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}
