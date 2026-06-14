import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeLoadedOrderIntoFullOrder } from "@minicollections/core";
import useInfiniteList from "./useInfiniteList.js";

function arrayMove(arr, from, to) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function useOrderableInfiniteBrowse({
  entityKey,
  enabled,
  fetchPage,
  fetchOrder,
  reorder,
  pageSize,
  reservedFirstPageSlots = 0,
  listResetKey = "browse",
}) {
  const resetKey = `${listResetKey}:${entityKey}`;
  const infinite = useInfiniteList(fetchPage, {
    resetKey,
    enabled,
    pageSize,
    reservedFirstPageSlots,
  });
  const { items, reorderLocalItems, refresh } = infinite;

  const [orderedIds, setOrderedIds] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const orderedIdsRef = useRef([]);
  const fetchOrderRef = useRef(fetchOrder);
  const reorderRef = useRef(reorder);
  const prevResetKeyRef = useRef(resetKey);
  fetchOrderRef.current = fetchOrder;
  reorderRef.current = reorder;

  const loadOrder = useCallback(async () => {
    if (!enabled) {
      setOrderedIds((current) => (current.length === 0 ? current : []));
      orderedIdsRef.current = [];
      return;
    }
    try {
      const response = await fetchOrderRef.current();
      const ids = Array.isArray(response?.ids) ? response.ids : [];
      const currentIds = orderedIdsRef.current;
      const unchanged =
        currentIds.length === ids.length &&
        currentIds.every((id, index) => id === ids[index]);
      if (unchanged) {
        return;
      }

      setOrderLoading(true);
      orderedIdsRef.current = ids;
      setOrderedIds(ids);
      reorderLocalItems(ids);
    } catch {
      setOrderedIds((current) => (current.length === 0 ? current : []));
      orderedIdsRef.current = [];
    } finally {
      setOrderLoading(false);
    }
  }, [enabled, reorderLocalItems]);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      orderedIdsRef.current = [];
      setOrderedIds([]);
    }
    loadOrder();
  }, [enabled, resetKey, loadOrder]);

  const itemsById = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);

  const displayItems = useMemo(() => {
    if (orderedIds.length === 0) {
      return items;
    }
    return orderedIds.map((id) => itemsById.get(id)).filter(Boolean);
  }, [orderedIds, itemsById, items]);

  const sortableIds = useMemo(() => {
    if (displayItems.length > 0) {
      return displayItems.map((item) => item.id);
    }
    return items.map((item) => item.id);
  }, [displayItems, items]);

  useEffect(() => {
    if (orderedIds.length > 0) {
      orderedIdsRef.current = orderedIds;
      return;
    }
    orderedIdsRef.current = items.map((item) => item.id);
  }, [orderedIds, items]);

  const sameId = (left, right) => String(left) === String(right);

  const handleDragEnd = useCallback(
    async (activeId, overId) => {
      if (!overId || sameId(activeId, overId)) return null;

      const fullOrder =
        orderedIds.length > 0
          ? orderedIdsRef.current
          : items.map((item) => item.id);
      const loadedOrder =
        displayItems.length > 0
          ? displayItems.map((item) => item.id)
          : items.map((item) => item.id);

      const oldIndex = loadedOrder.findIndex((id) => sameId(id, activeId));
      const newIndex = loadedOrder.findIndex((id) => sameId(id, overId));
      if (oldIndex < 0 || newIndex < 0) return null;

      const nextLoadedOrder = arrayMove(loadedOrder, oldIndex, newIndex);
      const nextFullOrder =
        orderedIds.length > 0
          ? mergeLoadedOrderIntoFullOrder(fullOrder, nextLoadedOrder)
          : nextLoadedOrder;
      const previousFullOrder = fullOrder;

      setOrderedIds(nextFullOrder);
      orderedIdsRef.current = nextFullOrder;
      reorderLocalItems(nextFullOrder);
      setReordering(true);

      try {
        await reorderRef.current(nextFullOrder);
        return true;
      } catch {
        setOrderedIds(previousFullOrder);
        orderedIdsRef.current = previousFullOrder;
        reorderLocalItems(previousFullOrder);
        return false;
      } finally {
        setReordering(false);
      }
    },
    [displayItems, items, orderedIds.length, reorderLocalItems],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([loadOrder(), refresh()]);
  }, [loadOrder, refresh]);

  return {
    ...infinite,
    displayItems,
    orderedIds: sortableIds,
    orderLoading,
    reordering,
    sortEnabled: enabled && sortableIds.length > 0,
    handleDragEnd,
    refreshAll,
    loadOrder,
  };
}
