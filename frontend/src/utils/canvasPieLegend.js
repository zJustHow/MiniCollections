import {
  itemsOf,
  labelOf,
  legendsOf,
  markerOf,
} from "@antv/g2/esm/interaction/legendFilter";
import { setStyle } from "@antv/g2/esm/utils/style";
import { resolveG2Chart } from "./g2Chart";

const LEGEND_INACTIVE_FILL = "#aaa";
const LEGEND_LABEL_FILL = "#44476a";
const LEGEND_LABEL_FILL_OPACITY = 0.9;

const LEGEND_ITEM_CLASS = "items-item";

function getCanvasRoot(g2Chart) {
  const canvas = g2Chart?.getContext?.()?.canvas;
  return canvas?.getRoot?.() ?? canvas?.document?.documentElement ?? null;
}

function legendValueFromItem(item, domain) {
  const datum = item?.__data__;
  if (!datum || datum.index == null) {
    return null;
  }
  return domain[datum.index] ?? null;
}

function collectLegendItems(root) {
  const items = new Set();

  if (!root) {
    return items;
  }

  for (const legend of legendsOf(root)) {
    for (const item of itemsOf(legend)) {
      items.add(item);
    }
  }

  const rootItems = root.getElementsByClassName?.(LEGEND_ITEM_CLASS);
  if (rootItems) {
    for (const item of rootItems) {
      items.add(item);
    }
  }

  return items;
}

function applyLegendItemInactive(item, inactive, activeColor) {
  const marker = markerOf(item);
  const label = labelOf(item);

  if (inactive) {
    if (marker?.style) {
      setStyle(marker, "fill", LEGEND_INACTIVE_FILL);
      setStyle(marker, "stroke", LEGEND_INACTIVE_FILL);
      setStyle(marker, "fillOpacity", 1);
      setStyle(marker, "strokeOpacity", 1);
    }
    if (label?.style) {
      setStyle(label, "fill", LEGEND_INACTIVE_FILL);
      setStyle(label, "fillOpacity", 1);
    }
    return;
  }

  if (marker?.style) {
    const color = activeColor ?? marker.style.fill;
    setStyle(marker, "fill", color);
    setStyle(marker, "stroke", color);
    setStyle(marker, "fillOpacity", 1);
    setStyle(marker, "strokeOpacity", 1);
  }

  if (label?.style) {
    setStyle(label, "fill", LEGEND_LABEL_FILL);
    setStyle(label, "fillOpacity", LEGEND_LABEL_FILL_OPACITY);
  }
}

export function syncPieLegendOpacity(
  plot,
  { domain, hiddenTypes = new Set(), getLegendColor } = {},
) {
  const g2Chart = resolveG2Chart(plot);
  if (!g2Chart) {
    return;
  }

  const root = getCanvasRoot(g2Chart);
  if (!root) {
    return;
  }

  for (const item of collectLegendItems(root)) {
    const value = legendValueFromItem(item, domain);
    if (!value) {
      continue;
    }
    applyLegendItemInactive(
      item,
      hiddenTypes.has(value),
      getLegendColor?.(value),
    );
  }
}

export function schedulePieLegendOpacitySync(
  plot,
  { domain, hiddenTypes = new Set(), getLegendColor } = {},
) {
  const g2Chart = resolveG2Chart(plot);
  if (!g2Chart) {
    return;
  }

  const syncParams = { domain, hiddenTypes, getLegendColor };

  if (typeof g2Chart.once === "function") {
    g2Chart.once("afterrender", () => syncPieLegendOpacity(plot, syncParams));
    return;
  }

  syncPieLegendOpacity(plot, syncParams);
}

export function bindCanvasPieLegendToggle(
  plot,
  { getDomain, getHiddenTypes, getLegendColor, onToggle },
) {
  const g2Chart = resolveG2Chart(plot);
  if (!g2Chart || !onToggle) {
    return () => {};
  }

  const itemCleanups = [];

  const cleanupItems = () => {
    itemCleanups.forEach((cleanup) => cleanup());
    itemCleanups.length = 0;
  };

  const resolveDomain = () => getDomain?.() ?? [];
  const resolveHidden = () => getHiddenTypes?.() ?? new Set();

  const syncLegend = () =>
    syncPieLegendOpacity(plot, {
      domain: resolveDomain(),
      hiddenTypes: resolveHidden(),
      getLegendColor,
    });

  const bindItems = () => {
    cleanupItems();
    const root = getCanvasRoot(g2Chart);
    if (!root) {
      return;
    }

    for (const item of collectLegendItems(root)) {
      const value = legendValueFromItem(item, resolveDomain());
      if (!value) {
        continue;
      }

      const onClick = (event) => {
        event?.stopPropagation?.();
        const willHide = !resolveHidden().has(value);
        applyLegendItemInactive(item, willHide, getLegendColor?.(value));
        onToggle(value);
      };
      item.addEventListener("click", onClick);
      itemCleanups.push(() => item.removeEventListener("click", onClick));
    }
  };

  const onAfterRender = () => {
    bindItems();
    if (resolveHidden().size > 0) {
      syncLegend();
    }
  };

  g2Chart.on("afterrender", onAfterRender);
  onAfterRender();

  return () => {
    g2Chart.off("afterrender", onAfterRender);
    cleanupItems();
  };
}
