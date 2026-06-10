import {
  bindCanvasPieLegendToggle,
  syncPieLegendOpacity,
} from "./canvasPieLegend";

const LEGEND_INACTIVE_FILL = "#aaa";

function createLegendItem(index) {
  const marker = {
    tagName: "circle",
    style: { fill: "#f00", fillOpacity: 1, strokeOpacity: 1 },
  };
  const label = {
    tagName: "text",
    style: { fill: "#111", fillOpacity: 1, strokeOpacity: 1 },
  };
  const item = {
    tagName: "g",
    style: {},
    __data__: { index },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getElementsByClassName: (className) => {
      if (className === "legend-category-item-marker") {
        return [marker];
      }
      if (className === "legend-category-item-label") {
        return [label];
      }
      return [];
    },
  };
  return { item, marker, label };
}

function createPlot(root) {
  const g2Chart = {
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    getContext: () => ({
      canvas: {
        getRoot: () => root,
      },
    }),
  };
  return { chart: g2Chart };
}

describe("canvasPieLegend", () => {
  test("grays legend item on click", () => {
    const { item, marker, label } = createLegendItem(1);
    const root = {
      getElementsByClassName: (className) =>
        className === "items-item" ? [item] : [],
    };
    const plot = createPlot(root);
    const onToggle = vi.fn();

    const cleanup = bindCanvasPieLegendToggle(plot, {
      getDomain: () => ["A", "B"],
      getHiddenTypes: () => new Set(),
      getLegendColor: () => "#f00",
      onToggle,
    });

    const clickHandler = item.addEventListener.mock.calls.find(
      ([event]) => event === "click",
    )?.[1];
    clickHandler?.({ stopPropagation: vi.fn() });

    expect(marker.style.fill).toBe(LEGEND_INACTIVE_FILL);
    expect(label.style.fill).toBe(LEGEND_INACTIVE_FILL);
    expect(onToggle).toHaveBeenCalledWith("B");
    cleanup();
  });

  test("dims and restores legend fill", () => {
    const { item, marker } = createLegendItem(1);
    const root = {
      getElementsByClassName: (className) =>
        className === "items-item" ? [item] : [],
    };
    const plot = createPlot(root);

    syncPieLegendOpacity(plot, {
      domain: ["A", "B"],
      hiddenTypes: new Set(["B"]),
      getLegendColor: () => "#f00",
    });
    expect(marker.style.fill).toBe(LEGEND_INACTIVE_FILL);

    syncPieLegendOpacity(plot, {
      domain: ["A", "B"],
      hiddenTypes: new Set(),
      getLegendColor: () => "#f00",
    });
    expect(marker.style.fill).toBe("#f00");
  });
});
