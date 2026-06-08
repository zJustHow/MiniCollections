import { Suspense } from "react";
import { lazyWithRetry } from "./lazyWithRetry";

/** Lazy-load a modal chunk only when it is opened. */
export function createLazyModal(importFn) {
  const LazyComponent = lazyWithRetry(importFn);

  function LazyModal({ open, visible, ...props }) {
    const isOpen = open ?? visible ?? false;
    if (!isOpen) return null;
    return (
      <Suspense fallback={null}>
        <LazyComponent open={open} visible={visible} {...props} />
      </Suspense>
    );
  }

  return LazyModal;
}
