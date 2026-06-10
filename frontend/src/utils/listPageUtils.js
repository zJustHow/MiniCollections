export function withAddCardSlot(items, showAddCard) {
  return showAddCard ? [{ id: "__add__" }, ...items] : items;
}

export function hasRealListItems(items) {
  return (items ?? []).some((item) => item.id !== "__add__");
}

export function shouldShowNoData(items, { loading = false } = {}) {
  if (loading) return false;
  const list = items ?? [];
  if (list.length === 0) return true;
  return !hasRealListItems(list) && !list.some((item) => item.id === "__add__");
}
