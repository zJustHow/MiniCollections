/**
 * Read the current URL search params from the browser.
 * React Router's setSearchParams functional updater receives a stale snapshot;
 * use this when multiple search-param updates may run in the same tick.
 */
export function readSearchParams() {
  return new URLSearchParams(window.location.search);
}

/**
 * Apply a mutation to the current URL search params via setSearchParams.
 */
export function mutateSearchParams(setSearchParams, mutator, navigateOptions) {
  setSearchParams(() => {
    const next = readSearchParams();
    mutator(next);
    return next;
  }, navigateOptions);
}
