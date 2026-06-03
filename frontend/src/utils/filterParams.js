export function appendIdListParams(params, key, ids) {
  if (!ids?.length) return;
  ids.forEach((id) => params.append(key, String(id)));
}

export function toggleInList(id, list) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function toggleIdInList(id, setList) {
  setList((prev) => toggleInList(id, prev));
}

export function filterKeyFromIds(categoryIds, brandIds, scaleIds) {
  const c = categoryIds?.length ? categoryIds.join(",") : "c";
  const b = brandIds?.length ? brandIds.join(",") : "b";
  const s = scaleIds?.length ? scaleIds.join(",") : "s";
  return `${c}:${b}:${s}`;
}
