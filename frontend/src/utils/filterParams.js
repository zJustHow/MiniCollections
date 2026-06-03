export function appendIdListParams(params, key, ids) {
  if (!ids?.length) return;
  ids.forEach((id) => params.append(key, String(id)));
}

export function toggleIdInList(id, setList) {
  setList((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
  );
}

export function filterKeyFromIds(categoryIds, brandIds, scaleIds) {
  const c = categoryIds?.length ? categoryIds.join(",") : "c";
  const b = brandIds?.length ? brandIds.join(",") : "b";
  const s = scaleIds?.length ? scaleIds.join(",") : "s";
  return `${c}:${b}:${s}`;
}
